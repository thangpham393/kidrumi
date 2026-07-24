import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Chuyển văn bản tiếng Anh thành giọng nói bằng Google Cloud Text-to-Speech.
// CHỈ hoạt động khi server có biến môi trường GOOGLE_TTS_API_KEY.
//   → có khoá:   trả về file MP3 (giọng Neural tự nhiên) cho bé nghe.
//   → không có:  trả 501 để client tự rớt về Web Speech API của trình duyệt.
// Nhờ vậy tính năng vẫn chạy được ngay mà không bắt buộc phải cấu hình gì.
export async function POST(req: Request) {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "tts-not-configured" }, { status: 501 });
  }

  let text = "";
  let lang = "en";
  try {
    const body = (await req.json()) as { text?: string; lang?: string };
    text = (body.text ?? "").toString().slice(0, 200).trim();
    lang = (body.lang ?? "en").toString();
  } catch {
    /* body rỗng/hỏng → xử lý bên dưới */
  }
  if (!text) {
    return NextResponse.json({ error: "empty-text" }, { status: 400 });
  }

  // Giọng nữ đọc chậm rãi cho bé tiền tiểu học, theo từng ngôn ngữ.
  const VOICES: Record<string, { languageCode: string; name: string }> = {
    en: { languageCode: "en-US", name: "en-US-Neural2-F" },
    zh: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A" }, // Quan thoại
  };
  const voice = VOICES[lang] ?? VOICES.en;

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.9, pitch: 1.5 },
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "tts-failed" }, { status: 502 });
  }

  const data = (await res.json()) as { audioContent?: string };
  if (!data.audioContent) {
    return NextResponse.json({ error: "tts-empty" }, { status: 502 });
  }

  const audio = Buffer.from(data.audioContent, "base64");
  return new NextResponse(audio, {
    headers: {
      "content-type": "audio/mpeg",
      // Câu lệnh lặp lại nhiều → cache 1 ngày cho nhẹ băng thông.
      "cache-control": "public, max-age=86400",
    },
  });
}
