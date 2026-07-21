// Logic nạp nội dung Shadowing từ link YouTube (dùng chung cho API route admin).
//
//   yt-dlp lấy metadata + phụ đề json3  ->  gộp thành câu (t + text)
//   ->  Claude điền tr + words + level + emoji  ->  ghi vào videos.generated.json
//
// Yêu cầu môi trường khi chạy (thường là lúc `npm run dev`):
//   - yt-dlp trên PATH (brew/pipx install yt-dlp). Đặt YT_DLP để trỏ binary khác.
//   - ANTHROPIC_API_KEY để gọi Claude.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const execFileP = promisify(execFile);

const YT_DLP = process.env.YT_DLP || "yt-dlp";
const MODEL = "claude-opus-4-8";
const DATA_FILE = path.join(process.cwd(), "app", "shadowing", "videos.generated.json");
const YT_ARGS = ["--extractor-args", "youtube:player_client=android", "--no-warnings"];

export type Lang = "en" | "zh";
export type Level = "de" | "mid" | "hard";
export interface Word {
  w: string;
  ph?: string;
  mean: string;
}
export interface Segment {
  t: number;
  text: string;
  tr: string;
  words?: Word[];
}
export interface GeneratedVideo {
  id: string;
  lang: Lang;
  title: string;
  source: string;
  level: Level;
  dur: string;
  emoji: string;
  youtubeId: string;
  segments: Segment[];
}

// Lỗi có thông điệp thân thiện để hiển thị cho người dùng trên trang admin.
export class ImportError extends Error {}

// ----------------------------------------------------------------------------
// YouTube (yt-dlp)
// ----------------------------------------------------------------------------

export function parseVideoId(url: string): string {
  const u = url.trim();
  const m =
    u.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([\w-]{11})/) ||
    u.match(/^([\w-]{11})$/);
  if (!m) throw new ImportError(`Không tách được video ID từ: ${url}`);
  return m[1];
}

async function ensureYtDlp() {
  try {
    await execFileP(YT_DLP, ["--version"]);
  } catch {
    throw new ImportError(
      `Không tìm thấy yt-dlp trên máy. Cài bằng:  brew install yt-dlp  ` +
        `(hoặc pipx install "yt-dlp[default]"), rồi mở lại trang này.`
    );
  }
}

interface Meta {
  id: string;
  title: string;
  uploader: string;
  duration: number;
}

async function fetchMeta(videoId: string): Promise<Meta> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  let stdout: string;
  try {
    ({ stdout } = await execFileP(YT_DLP, ["-J", "--skip-download", ...YT_ARGS, url], {
      maxBuffer: 64 * 1024 * 1024,
    }));
  } catch (e) {
    throw new ImportError(
      `Không lấy được thông tin video ${videoId}: ${firstLine(e)}`
    );
  }
  const info = JSON.parse(stdout);
  return {
    id: info.id,
    title: info.title || "",
    uploader: info.uploader || info.channel || "YouTube",
    duration: Number(info.duration) || 0,
  };
}

interface RawLine {
  t: number;
  text: string;
}

async function fetchSubtitles(
  videoId: string,
  forcedLang?: Lang
): Promise<{ lang: Lang; lines: RawLine[] }> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kidrumi-sub-"));
  try {
    let stderr = "";
    try {
      ({ stderr = "" } = await execFileP(
        YT_DLP,
        [
          "--skip-download",
          "--write-subs",
          "--write-auto-subs",
          "--sub-format",
          "json3",
          "--sub-langs",
          "en.*,zh-Hans,zh-Hant,zh",
          "--sleep-subtitles",
          "1",
          "--retries",
          "5",
          "--extractor-retries",
          "3",
          ...YT_ARGS,
          "-o",
          path.join(dir, "sub"),
          url,
        ],
        { maxBuffer: 16 * 1024 * 1024 }
      ));
    } catch (e) {
      stderr = String((e as { stderr?: string })?.stderr || "");
    }

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json3"));
    if (files.length === 0) {
      if (/429|Too Many Requests/i.test(stderr)) {
        throw new ImportError(
          `YouTube tạm chặn (HTTP 429) khi tải phụ đề. Chờ vài phút rồi thử lại. ` +
            `Mẹo giảm bị chặn: cài  pip install "yt-dlp[default]".`
        );
      }
      throw new ImportError(`Video này không có phụ đề nào (kể cả tự động).`);
    }

    const byLang: Record<string, string> = {};
    for (const f of files) {
      const m = f.match(/\.([\w-]+)\.json3$/);
      if (m) byLang[m[1]] = path.join(dir, f);
    }
    const codes = Object.keys(byLang);

    const lang: Lang = forcedLang ?? (codes.some((c) => c.startsWith("zh")) ? "zh" : "en");
    const pref = lang === "zh" ? ["zh-Hans", "zh", "zh-Hant"] : ["en-orig", "en"];
    let file = pref.map((c) => byLang[c]).find(Boolean);
    if (!file) file = codes.filter((c) => c.startsWith(lang)).map((c) => byLang[c])[0];
    if (!file) {
      throw new ImportError(
        `Không có phụ đề cho ngôn ngữ "${lang}". Có sẵn: ${codes.join(", ")}. ` +
          `Thử chọn ngôn ngữ khác.`
      );
    }

    const lines = parseJson3(fs.readFileSync(file, "utf8"));
    if (lines.length === 0) throw new ImportError(`Phụ đề rỗng sau khi làm sạch.`);
    return { lang, lines };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

interface Json3Event {
  tStartMs?: number;
  segs?: { utf8?: string }[];
}

function parseJson3(raw: string): RawLine[] {
  const data = JSON.parse(raw) as { events?: Json3Event[] };
  const lines: RawLine[] = [];
  let prev = "";
  for (const ev of data.events || []) {
    if (!ev.segs) continue;
    let text = ev.segs
      .map((s) => s.utf8 || "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    text = text.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
    if (!text || text === prev) continue;
    prev = text;
    lines.push({ t: Math.max(0, Math.floor((ev.tStartMs || 0) / 1000)), text });
  }
  return lines;
}

const CJK = /[㐀-鿿豈-﫿]/;

function mergeSegments(lines: RawLine[]): { t: number; text: string }[] {
  const segs: { t: number; text: string }[] = [];
  let buf: { t: number; text: string } | null = null;
  const flush = () => {
    if (buf && buf.text.trim()) segs.push({ t: buf.t, text: buf.text.trim() });
    buf = null;
  };
  for (const { t, text } of lines) {
    if (!buf) buf = { t, text };
    else buf.text += CJK.test(text) ? text : " " + text;
    const s = buf.text.trim();
    const endsSentence = /[.!?。！？…]$/.test(s);
    const long = CJK.test(s) ? s.length >= 18 : s.split(/\s+/).length >= 10;
    if (endsSentence || long) flush();
  }
  flush();
  return segs;
}

// ----------------------------------------------------------------------------
// Claude: điền tr + words + level + emoji
// ----------------------------------------------------------------------------

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    level: { type: "string", enum: ["de", "mid", "hard"] },
    emoji: { type: "string" },
    segments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          tr: { type: "string" },
          words: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                w: { type: "string" },
                ph: { type: "string" },
                mean: { type: "string" },
              },
              required: ["w", "ph", "mean"],
            },
          },
        },
        required: ["tr", "words"],
      },
    },
  },
  required: ["level", "emoji", "segments"],
} as const;

interface AiResult {
  level: Level;
  emoji: string;
  segments: { tr: string; words: Word[] }[];
}

async function annotate(
  lang: Lang,
  title: string,
  segs: { t: number; text: string }[]
): Promise<AiResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ImportError(
      `Chưa có ANTHROPIC_API_KEY. Đặt biến môi trường này (khoá API Claude) rồi khởi động lại server.`
    );
  }
  const client = new Anthropic();
  const langName = lang === "zh" ? "tiếng Trung" : "tiếng Anh";
  const phKind = lang === "zh" ? "pinyin (có dấu thanh)" : "IPA";
  const prompt = [
    `Bạn giúp soạn nội dung học ${langName} cho trẻ mầm non người Việt (app Kidrumi).`,
    `Video: "${title}".`,
    ``,
    `Transcript đã tách câu (JSON, đúng thứ tự):`,
    JSON.stringify(segs.map((s, i) => ({ i, text: s.text }))),
    ``,
    `Trả về JSON đúng schema:`,
    `- "level": độ khó cho bé mầm non — "de" (dễ), "mid" (trung bình), "hard" (khó).`,
    `- "emoji": 1 emoji đại diện chủ đề video.`,
    `- "segments": mảng CÙNG SỐ LƯỢNG và CÙNG THỨ TỰ transcript. Mỗi phần tử:`,
    `    - "tr": bản dịch tiếng Việt tự nhiên, thân thiện với trẻ.`,
    `    - "words": 0–4 từ/cụm đáng chú ý trong câu. Mỗi từ gồm "w" (nguyên văn ${langName}),`,
    `      "ph" (phiên âm ${phKind}), "mean" (nghĩa tiếng Việt ngắn). Bỏ qua từ tầm thường;`,
    `      câu đơn giản có thể để words rỗng.`,
    `Chỉ trả JSON, không thêm chữ nào khác.`,
  ].join("\n");

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ImportError("Claude không trả về nội dung.");
  }
  try {
    return JSON.parse(textBlock.text) as AiResult;
  } catch {
    throw new ImportError("Không đọc được JSON từ Claude.");
  }
}

// ----------------------------------------------------------------------------
// File dữ liệu
// ----------------------------------------------------------------------------

export function readGenerated(): GeneratedVideo[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
    return raw ? (JSON.parse(raw) as GeneratedVideo[]) : [];
  } catch {
    return [];
  }
}

function writeGenerated(list: GeneratedVideo[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2) + "\n");
}

export function deleteGenerated(id: string): GeneratedVideo[] {
  const list = readGenerated().filter((v) => v.id !== id);
  writeGenerated(list);
  return list;
}

function slugify(title: string, fallback: string): string {
  const s = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s.length >= 3 ? s : fallback;
}

function uniqueId(base: string, taken: Set<string>): string {
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function firstLine(e: unknown): string {
  return String((e as Error)?.message || e).split("\n")[0];
}

// ----------------------------------------------------------------------------
// Điểm vào chính: import 1 link và ghi vào file dữ liệu.
// ----------------------------------------------------------------------------

export async function importFromUrl(
  url: string,
  forcedLang?: Lang
): Promise<{ video: GeneratedVideo; updated: boolean; total: number }> {
  await ensureYtDlp();
  const videoId = parseVideoId(url);

  const meta = await fetchMeta(videoId);
  const { lang, lines } = await fetchSubtitles(videoId, forcedLang);
  const rawSegs = mergeSegments(lines);
  const ai = await annotate(lang, meta.title, rawSegs);

  const segments: Segment[] = rawSegs.map((s, i) => {
    const a = ai.segments[i] || ({} as { tr?: string; words?: Word[] });
    const words = Array.isArray(a.words)
      ? a.words
          .filter((w) => w && w.w && w.mean)
          .map((w) => ({ w: w.w, ph: w.ph || "", mean: w.mean }))
      : [];
    return { t: s.t, text: s.text, tr: a.tr || "", ...(words.length ? { words } : {}) };
  });

  const list = readGenerated();
  const taken = new Set(list.map((v) => v.id));
  const existing = list.find((v) => v.youtubeId === videoId);
  const id = existing ? existing.id : uniqueId(slugify(meta.title, `${lang}-${videoId}`), taken);

  const video: GeneratedVideo = {
    id,
    lang,
    title: meta.title,
    source: meta.uploader,
    level: (["de", "mid", "hard"] as Level[]).includes(ai.level) ? ai.level : "de",
    dur: meta.duration ? fmtTime(meta.duration) : "0:00",
    emoji: ai.emoji || (lang === "zh" ? "🀄" : "🎬"),
    youtubeId: videoId,
    segments,
  };

  const idx = list.findIndex((v) => v.id === id);
  if (idx >= 0) list[idx] = video;
  else list.push(video);
  writeGenerated(list);

  return { video, updated: idx >= 0, total: list.length };
}
