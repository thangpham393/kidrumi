#!/usr/bin/env bash
# Tải ảnh Microsoft Fluent Emoji 3D (MIT) còn thiếu vào public/emoji/, đặt tên
# theo codepoint (giống components/Emoji.tsx: hệ 16, nối "-", BỎ fe0f).
# Component <Emoji> tự rớt về emoji hệ thống nếu thiếu ảnh — nhưng nên tải cho
# đồng bộ 3D mọi máy.
#
# Cách dùng: sửa mảng `pairs` bên dưới rồi chạy từ gốc repo:  bash fetch-fluent-emoji.sh
# Mỗi dòng:  "<codepoint-slug>|<Tên thư mục trong repo Fluent>|<tên_file_snake>"
#   - Tên thư mục = nhãn CLDR viết hoa đầu, giữ dấu cách/gạch nối (vd "Leafy green", "Yo-yo").
#   - tên_file    = viết thường, dấu cách/gạch nối -> "_", rồi + "_3d.png" (vd leafy_green).
# Tra codepoint nhanh:
#   node -e 'const e=process.argv[1];console.log([...e].map(c=>c.codePointAt(0).toString(16)).filter(h=>h!=="fe0f").join("-"))' "🧺"
set -euo pipefail
base="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets"
pairs=(
  "1f9fa|Basket|basket"
  "1f966|Broccoli|broccoli"
  "1f96c|Leafy green|leafy_green"
  # Cái nào hơn? (math/compare)
  "1f56f|Candle|candle"
  "1f384|Christmas tree|christmas_tree"
  "1f332|Evergreen tree|evergreen_tree"
  "1f3e2|Office building|office_building"
  "1f956|Baguette bread|baguette_bread"
  "1f425|Front-facing baby chick|front-facing_baby_chick"
  "1f41e|Lady beetle|lady_beetle"
  "1f31f|Glowing star|glowing_star"
  "2764|Red heart|red_heart"
  "1f380|Ribbon|ribbon"
  # Bé học chữ Hán — linh vật đơn vị.
  # LƯU Ý: 🧒 có biến thể tông da → file 3D nằm ở Child/Default/3D/child_3d_default.png
  # (không theo mẫu $folder/3D/${file}_3d.png), đã tải tay. Giữ dòng này để khỏi tải lại.
  "1f9d2|Child|child"
)
for p in "${pairs[@]}"; do
  IFS='|' read -r cp folder file <<< "$p"
  [ -f "public/emoji/$cp.png" ] && { echo "· $cp đã có, bỏ qua"; continue; }
  enc=$(printf '%s' "$folder" | sed 's/ /%20/g')
  url="$base/$enc/3D/${file}_3d.png"
  code=$(curl -s -o "/tmp/em_$cp.png" -w "%{http_code}" "$url")
  if [ "$code" = "200" ] && file -b "/tmp/em_$cp.png" | grep -q "PNG image"; then
    cp "/tmp/em_$cp.png" "public/emoji/$cp.png"; echo "✓ $cp  ($folder)"
  else
    echo "✗ $cp  HTTP $code — kiểm lại tên thư mục/file '$folder'"
  fi
done
