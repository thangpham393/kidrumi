---
name: shadowing-import
description: >-
  Import YouTube video(s) — a single link OR a whole playlist — into the Kidrumi
  Shadowing library (app/shadowing/videos.generated.json). Fetches transcript
  (YouTube captions, or ASR via mlx_whisper when the video has no captions),
  annotates each line with Vietnamese translation + pinyin/IPA + key words, and
  tags every video with a source label and difficulty level (de/mid/hard or l1 =
  "Level 1"). Use whenever asked to "import video", add a YouTube link/playlist to
  Shadowing / luyện nghe-nói, or nạp video vào thư viện Little Fox / Level 1.
---

# Nạp video vào thư viện Shadowing (Kidrumi)

Quy trình đã kiểm chứng: **YouTube → transcript (caption hoặc ASR) → chú thích tiếng Việt → gộp vào `app/shadowing/videos.generated.json`** với nhãn nguồn + độ khó tuỳ chọn. Bộ lọc nguồn/độ khó trong UI **tự suy ra** từ dữ liệu nên không cần sửa tay khi thêm nguồn/level đã tồn tại.

## 0. Thu thập tham số (hỏi nếu thiếu)
- **URL**: link video lẻ (`youtu.be/…`, `watch?v=…`) hoặc playlist (`playlist?list=…`). Lưu ý: `?si=…` chỉ là mã chia sẻ, KHÔNG phải playlist — playlist phải có `list=`.
- **Ngôn ngữ** nguồn: `zh` (Trung) hay `en` (Anh).
- **Nhãn nguồn** (`source`): chuỗi tự do hiện thành pill lọc, vd `"Little Fox"`.
- **Độ khó** (`level`): `de` (Dễ) · `mid` (Trung bình) · `hard` (Khó) · `l1` (Level 1). Bộ Little Fox Early Learning 1 → `l1`.
- **id-prefix**: tiền tố slug id để URL không đụng nhau, vd `lf1` → id `lf1-<youtubeId>`.

## 1. Đảm bảo công cụ (macOS Apple Silicon)
```bash
command -v yt-dlp || brew install yt-dlp
command -v ffmpeg || brew install ffmpeg
command -v mlx_whisper   # CLI ASR (Metal GPU). Nếu thiếu: pipx install mlx-whisper
```
`ANTHROPIC_API_KEY` **không bắt buộc** — bước dịch do agent/subagent làm trực tiếp (xem mục 4).

## 2. Thư mục làm việc + danh sách video
Tạo BASE trong scratchpad, rồi dựng `playlist.json = [{id,title,dur}]`:
```bash
BASE=<scratchpad>/shadowing-import; mkdir -p "$BASE"
# Playlist (có list=):
yt-dlp --flat-playlist -J --extractor-args "youtube:player_client=android" --no-warnings "<PLAYLIST_URL>" \
 | python3 -c "import json,sys;d=json.load(sys.stdin);json.dump([{'id':x['id'],'title':x.get('title',''),'dur':x.get('duration')} for x in d['entries']],open('$BASE/playlist.json','w'),ensure_ascii=False,indent=1)"
# Hoặc 1 video lẻ:
yt-dlp -J --no-warnings "<VIDEO_URL>" \
 | python3 -c "import json,sys;d=json.load(sys.stdin);json.dump([{'id':d['id'],'title':d.get('title',''),'dur':d.get('duration')}],open('$BASE/playlist.json','w'),ensure_ascii=False,indent=1)"
```

## 3. Dựng transcript
Kiểm tra phụ đề: `yt-dlp --list-subs "<url>"`.
- **Nhiều bộ thiếu phụ đề hoàn toàn** (vd Little Fox Chinese) → **bắt buộc ASR**.
- Đường ASR (mặc định, luôn chạy được):
  ```bash
  bash .claude/skills/shadowing-import/scripts/asr_batch.sh "$BASE" <zh|en>
  ```
  Resumable, tạo `raw/<id>.json`. `whisper-medium` cân bằng tốc độ/chất lượng; lần đầu tải model 1 lần. ~10–40s/video. Chạy **nền** cho playlist lớn.
- (Tuỳ chọn) Nếu video CÓ phụ đề và có `ANTHROPIC_API_KEY`: có thể dùng pipeline sẵn ở [lib/shadowing-import.ts](../../lib/shadowing-import.ts) qua trang admin `/admin/shadowing` thay cho ASR — nhưng đường ASV + chú thích bằng agent dưới đây không cần API key.

## 4. Chú thích (dịch VN + phiên âm) — fan-out subagent
Chia id thành các nhóm ~10, giao **nhiều subagent `general-purpose` chạy song song** (một message nhiều Agent). Mỗi subagent: đọc [references/annotate-spec.md](references/annotate-spec.md), xử lý nhóm id của mình, ghi `anno/<id>.json`. Truyền cho subagent: đường dẫn spec, `$BASE`, danh sách id, ngôn ngữ. (Đây là bước thay cho "Claude API" — agent chính là Claude nên không tốn API key.)

Kiểm tra toàn vẹn trước khi lắp ráp:
```bash
python3 -c "
import json,os,glob
base='$BASE'; pl=json.load(open(base+'/playlist.json'))
bad=[]
for e in pl:
    v=e['id']; ap=base+f'/anno/{v}.json'; rp=base+f'/raw/{v}.json'
    if not os.path.exists(ap): bad.append((v,'no anno')); continue
    if len(json.load(open(ap)).get('segments',[]))!=len(json.load(open(rp))): bad.append((v,'seg mismatch'))
print('bad:', bad or 'none')
"
```

## 5. Lắp ráp (gộp) vào thư viện
```bash
python3 .claude/skills/shadowing-import/scripts/assemble.py \
  --base "$BASE" --out app/shadowing/videos.generated.json \
  --source "Little Fox" --level l1 --lang zh --id-prefix lf1
```
MERGE theo `youtubeId`: import lại cùng video sẽ **cập nhật**, video mới thì **thêm**. Không đụng seed trong `data.ts`.

## 6. Data model (chỉ khi thêm ĐỘ KHÓ MỚI)
Nguồn/độ khó **đã tồn tại** thì tự hiện trong bộ lọc — bỏ qua mục này. Nếu cần một level **mới** (vd `l2` = "Level 2"), sửa [app/shadowing/data.ts](../../app/shadowing/data.ts): thêm vào `type Level`, `levelLabel`, `levelCls`, `levelOrder`; và thêm `.vid .lvl.<cls>` trong [app/globals.css](../../app/globals.css). Bộ lọc `sourcesByLang`/`levelsByLang` suy ra động, không cần đụng. Nếu tab mặc định (`defaultLang`) rỗng thì nó tự nhảy sang tab có video.

## 7. Kiểm chứng
```bash
npx tsc --noEmit -p tsconfig.json         # phải sạch
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shadowing   # 200 (nếu dev server chạy)
```
Chụp trực quan (tab chuyển bằng React state, cần trình duyệt thật):
- `npm i puppeteer-core --no-save`, import từ đường tuyệt đối `node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js`, dùng Chrome ở `/Applications/Google Chrome.app/…`, click `.lang-tab` chứa "Chinese", set `deviceScaleFactor`/viewport (desktop 1280 + mobile 390 theo DESIGN.md), `.screenshot()`.
- **Dọn sau khi chụp**: `--no-save` vẫn làm bẩn `package-lock.json` → chạy lại `npm install` để đồng bộ lock về đúng `package.json`, và `rm -rf node_modules/puppeteer-core`.

## Cạm bẫy đã gặp (đừng vấp lại)
- **Video không có phụ đề** (Little Fox Chinese…): pipeline caption cũ vô dụng → phải ASR.
- **id bắt đầu bằng `-`** (vd `-ziqXj0gi3c`): làm hỏng `mlx_whisper --output-name` và tham số vị trí. `asr_batch.sh` đã né bằng output-name cố định + prefix `./` + URL `watch?v=`.
- **Mốc thời gian ASR là gần đúng** (theo câu) — đủ cho highlight, không sát mili-giây.
- ASR có thể nghe nhầm nhạc hiệu/intro; chấp nhận cho bản nhập, chỉ chỉnh tay nếu người dùng yêu cầu.
- Model `mlx-community/whisper-medium-mlx` đủ tốt; cần chính xác hơn dùng `whisper-large-v3-mlx` (chậm hơn).
