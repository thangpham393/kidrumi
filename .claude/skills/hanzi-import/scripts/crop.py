#!/usr/bin/env python3
# Cắt TRANH minh hoạ từ ảnh trang sách 直映识字 (đã pdfimages -j ra <srcdir>/p-XXX.jpg).
# Bỏ chữ (trái trên) + "chữ biến hình" đỏ (phải trên) + số trang (góc dưới-phải),
# chỉ lấy vùng tranh màu, tự cắt sát (autocrop) rồi lưu vuông nền trắng.
#
# Cài Pillow nếu thiếu:  pip3 install --break-system-packages --user Pillow
# Dùng:  python3 crop.py <srcdir> <pageIdx:slug> [<pageIdx:slug> ...]
#   pageIdx = số của pdfimages (trang 1 -> 0).  slug = pinyin + số thanh (vd shang4, er3).
# Ví dụ:  python3 crop.py /tmp/hz 10:shou3 11:zu2 12:shen1
#
# Ảnh lưu vào public/illustrations/hanzi/<slug>.png (720x720). Chạy từ gốc repo,
# hoặc sửa OUT bên dưới cho đúng.
import sys, os
from PIL import Image, ImageChops

OUT = "public/illustrations/hanzi"
REGION = (40, 560, 1235, 1635)  # (x1,y1,x2,y2): vùng chứa tranh; chỉnh nếu tranh bị cụt
PAD = 28
CANVAS = 720
THRESH = 14  # ngưỡng "khác trắng" khi autocrop


def autocrop_bbox(im):
    bg = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert("L").point(lambda p: 255 if p > THRESH else 0)
    return diff.getbbox()


def main():
    if len(sys.argv) < 3:
        print("Dùng: python3 crop.py <srcdir> <pageIdx:slug> [...]", file=sys.stderr)
        sys.exit(1)
    srcdir = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    for pair in sys.argv[2:]:
        idx_s, slug = pair.split(":")
        idx = int(idx_s)
        src = os.path.join(srcdir, f"p-{idx:03d}.jpg")
        if not os.path.exists(src):
            print(f"!! thiếu {src}", file=sys.stderr)
            continue
        im = Image.open(src).convert("RGB")
        reg = im.crop(REGION)
        bb = autocrop_bbox(reg)
        if not bb:
            print(f"!! trống {slug}", file=sys.stderr)
            continue
        x1, y1, x2, y2 = bb
        x1 = max(0, x1 - PAD); y1 = max(0, y1 - PAD)
        x2 = min(reg.width, x2 + PAD); y2 = min(reg.height, y2 + PAD)
        crop = reg.crop((x1, y1, x2, y2))
        s = max(crop.size)
        canvas = Image.new("RGB", (s, s), (255, 255, 255))
        canvas.paste(crop, ((s - crop.width) // 2, (s - crop.height) // 2))
        canvas = canvas.resize((CANVAS, CANVAS), Image.LANCZOS)
        canvas.save(os.path.join(OUT, f"{slug}.png"))
        print(f"✓ {slug}.png  (từ {crop.size})")


if __name__ == "__main__":
    main()
