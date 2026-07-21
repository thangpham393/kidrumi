#!/bin/bash
# Tải audio + ASR (mlx_whisper) cho từng video liệt kê trong <BASE>/playlist.json.
# Resumable: bỏ qua id đã có raw/<id>.json.
#
# Dùng:  asr_batch.sh <BASE_DIR> [LANG] [MODEL]
#   BASE_DIR: thư mục làm việc, PHẢI có playlist.json = [{"id","title","dur"}, ...]
#   LANG    : mã ngôn ngữ whisper (mặc định: zh). Dùng "en" cho tiếng Anh.
#   MODEL   : repo model mlx (mặc định: mlx-community/whisper-medium-mlx;
#             dùng whisper-large-v3-mlx nếu cần chính xác hơn, chậm hơn).
# Kết quả: <BASE>/raw/<id>.json = [{ "t": <giây>, "text": "<câu>" }, ...]
set -u
BASE="${1:?Thiếu BASE_DIR}"; LANG_CODE="${2:-zh}"; MODEL="${3:-mlx-community/whisper-medium-mlx}"
cd "$BASE" || exit 1
mkdir -p audio raw raw_tmp logs
IDS=$(python3 -c "import json;[print(e['id']) for e in json.load(open('playlist.json'))]")
n=0; total=$(echo "$IDS" | grep -c .)
for id in $IDS; do
  n=$((n+1))
  if [ -f "raw/$id.json" ]; then echo "[$n/$total] $id  skip (done)"; continue; fi
  if [ ! -f "audio/$id.mp3" ]; then
    echo "[$n/$total] $id  downloading…"
    yt-dlp -f "bestaudio/best" -x --audio-format mp3 --audio-quality 5 --no-warnings \
      -o "audio/$id.%(ext)s" "https://www.youtube.com/watch?v=$id" >"logs/$id.dl.log" 2>&1
  fi
  if [ ! -f "audio/$id.mp3" ]; then echo "  !! download failed $id (xem logs/$id.dl.log)"; continue; fi
  echo "[$n/$total] $id  transcribing…"
  # output-name cố định 'asrtmp' để tránh lỗi khi id bắt đầu bằng '-'; ./ prefix cho audio cũng vậy.
  rm -f raw_tmp/asrtmp.json
  mlx_whisper "./audio/$id.mp3" --model "$MODEL" --language "$LANG_CODE" \
    --output-format json --output-name asrtmp -o raw_tmp >"logs/$id.asr.log" 2>&1
  if [ -f "raw_tmp/asrtmp.json" ]; then
    python3 -c "
import json
d=json.load(open('raw_tmp/asrtmp.json'))
segs=[{'t':max(0,int(s.get('start',0))),'text':s['text'].strip()} for s in d.get('segments',[]) if s.get('text','').strip()]
json.dump(segs,open('raw/$id.json','w'),ensure_ascii=False,indent=1)
print('  ->',len(segs),'segments')
"
  else
    echo "  !! asr failed $id (xem logs/$id.asr.log)"
  fi
done
echo "DONE. raw: $(ls raw/*.json 2>/dev/null | grep -c .)/$total"
