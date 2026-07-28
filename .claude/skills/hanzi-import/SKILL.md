---
name: hanzi-import
description: >-
  Thêm/mở rộng đơn vị chữ cho mục "Bé học chữ Hán" (app/chinese/hanzi) của KATKID
  từ sách 直映识字. Bao gồm: trích + cắt tranh minh hoạ từ PDF (pdfimages + Pillow),
  lấy dữ liệu nét cho Hanzi Writer (hanzi-writer-data), thêm HanziUnit vào data.ts
  (pinyin có dấu + nghĩa/từ ghép/câu ví dụ tiếng Việt), mở openPaths, và kiểm thử.
  Dùng khi được yêu cầu "thêm đơn vị", "import các chữ còn lại", "làm đơn vị số đếm",
  hay mở rộng nội dung mục Bé học chữ Hán.
---

# Import đơn vị chữ cho "Bé học chữ Hán"

Mục này (`app/chinese/hanzi`) đã dựng xong khung: 3 màn (danh sách đơn vị → lưới chữ
田字格 → học chữ 4 bước 认·学·练·写) + Hanzi Writer cho bước viết. Việc còn lại chỉ là
**thêm dữ liệu chữ + tranh** cho các đơn vị mới. **Mỗi đơn vị 5 chữ.**

## 0. Nguồn & bố cục sách
- PDF: **`~/Downloads/1_直映识字 1.pdf`** (144 trang, mỗi trang = 1 chữ). Mỗi trang:
  chữ đen (trái trên) · "chữ biến hình" đỏ (phải trên) · **tranh màu** (giữa/dưới) ·
  mã bài `X-Y-Z` (góc phải dưới).
- Thứ tự đã biết:
  - **Bài 1-1 (trang 1–13, bộ phận cơ thể):** 人1 头2 目3 眉4 鼻5 耳6 口7 牙8 舌9 心10 手11 足12 身13
  - **Bài 1-2 (trang 14+, số đếm bằng kẹo):** 一14 二15 三16 四17 五18 六19 七20 …（八九十 kế tiếp)
- **Đã dùng:** Đơn vị 1 = 人头目眉鼻 · Đơn vị 2 = 耳口牙舌心.
  **Còn trong bài 1-1:** 手 足 身 (trang 11–13). Rồi tới số đếm.
- Xác định trang↔chữ: dùng công cụ **Read trên PDF** (tham số `pages`, tối đa 20 trang/lần),
  nhìn mã `X-Y-Z` góc dưới. `pdfimages` đánh số **p-{trang−1}** (trang 1 → p-000).

## 1. Trích + cắt tranh minh hoạ
Tranh mỗi trang là 1 ảnh JPEG nguyên trang → cần cắt lấy vùng tranh màu (bỏ chữ + morph +
số trang). Máy **không có ImageMagick**; dùng **Pillow** (cài: `pip3 install --break-system-packages --user Pillow`).

```bash
cd ~/Downloads
pdfimages -j "1_直映识字 1.pdf" /tmp/hz/p     # /tmp/hz/p-000.jpg …
# rồi cắt: tham số là <thư mục ảnh> và các cặp "pageIdx:slug" (pageIdx = trang−1)
python3 /Users/hathang/kidrumi/.claude/skills/hanzi-import/scripts/crop.py /tmp/hz 10:shou3 11:zu2 12:shen1
```
- **slug = pinyin + số thanh** (1–5), vd `shang4`, `er3` (耳), `er4` (二) — để tránh trùng
  đồng âm. Ảnh lưu `public/illustrations/hanzi/<slug>.png` (vuông 720px, nền trắng).
- Vùng cắt mặc định trong `crop.py` là `(40,560,1235,1635)` hợp cho phần lớn trang; nếu tranh
  bị cụt (vd số đếm nằm cao hơn) thì mở `crop.py` chỉnh `REGION`.
- Xem lại vài ảnh bằng Read để chắc sạch (không dính chữ/số/nét đỏ).
- Vệt bóng scan mờ ở mép: có thể thêm bước xoá nền gần-trắng trong `crop.py` nếu cần (chưa làm).

## 2. Dữ liệu nét (bước 写)
Copy JSON nét từ gói đã cài:
```bash
cd /Users/hathang/kidrumi
node -e 'const fs=require("fs");for(const c of ["手","足","身"]){fs.copyFileSync("node_modules/hanzi-writer-data/"+c+".json","public/hanzi-data/"+c+".json")}'
```
File đặt theo **chữ Hán** (`public/hanzi-data/<char>.json`); StepWrite nạp qua
`charDataLoader: ()=>fetch("/hanzi-data/"+char+".json")`.

## 3. Thêm HanziUnit vào data.ts
Sửa `app/chinese/hanzi/data.ts` — thêm phần tử vào `UNITS`:
```ts
{
  id: "u3", title: "Đơn vị 3", preview: "手足身…", emoji: "🖐️", // linh vật đơn vị
  cards: [
    { char: "手", pinyin: "shǒu", meaning: "bàn tay", img: "/illustrations/hanzi/shou3.png",
      emoji: "🖐️", word: "手指", wordPinyin: "shǒu zhǐ", wordMeaning: "ngón tay",
      sentence: "我用手拿东西。", sentenceMeaning: "Mình dùng tay cầm đồ." },
    // …đủ 5 chữ
  ],
}
```
Quy ước nội dung: **pinyin có dấu thanh**; nghĩa/từ ghép/câu ví dụ **tiếng Việt cho trẻ**
(nguồn mở chỉ có nghĩa Anh → biên soạn tay, ngắn gọn, thân thiện). `img` = `/illustrations/hanzi/<slug>.png`,
`emoji` = dự phòng khi thiếu ảnh.

## 4. Mở openPaths (xem tự do lưới chữ)
`app/chinese/layout.tsx` — thêm path đơn vị mới vào `openPaths` để màn lưới chữ xem không cần
đăng nhập (màn học chi tiết `[unit]/[idx]` vẫn cần đăng nhập, đúng nếp repo):
```ts
openPaths={["/chinese","/chinese/listen","/chinese/hanzi","/chinese/hanzi/u1","/chinese/hanzi/u2","/chinese/hanzi/u3"]}
```

## 5. Kiểm thử
- Dev server **:3001** (Turbopack khoá 1 instance — đừng mở cổng khác; :3000 có thể là prod cũ).
- `npx tsc --noEmit` + `npx eslint app/chinese components/hanzi` phải sạch.
- Chụp bằng CDP: `node .claude/skills/vuon-toan-game/scripts/cdp-shot.js <url> out.png 1280 900 2 0`.
  Click sang tab bằng script `cdp-tab.js` (trong scratchpad phiên trước) nếu cần.
- ⚠️ **Headless đóng băng animation** (bước 练/写 chuyển động, nét hồng + bàn tay ở 写) → ảnh
  headless không bắt được chuyển động; trình duyệt thật vẫn chạy. Muốn kiểm nét hồng khớp khuôn:
  ép `stroke`/fill hiện tĩnh qua CDP `Runtime.evaluate` rồi chụp.

## 6. Ghi chú kỹ thuật bước 写 (StepWrite.tsx)
- Nét gợi ý (hồng) + bàn tay 3D `👆` (`public/emoji/1f446.png`) đặt trong **một SVG overlay
  riêng phủ tuyệt đối** lên khung → Hanzi Writer append lớp nào cũng không đè.
- Overlay dùng đúng transform của Hanzi Writer:
  `CHAR_TF = translate(PAD, SIZE−PAD−124·SC) scale(SC, −SC)` với `SIZE=300, PAD=14, SC=(300−28)/1024`
  ( = `translate(14, 253.0625) scale(0.265625, -0.265625)` ). Đừng dùng `translate(14,286)` (lệch 33px).
- `mapPt(x,y) = [PAD + x·SC, (SIZE−PAD−124·SC) − y·SC]` để đặt bàn tay theo toạ độ median.

## 7. Bản quyền
Tranh lấy từ sách xuất bản 直映识字 → ổn cho dùng nội bộ/học; cân nhắc nếu phát hành công khai.
