# Ảnh minh hoạ cho Kidrumi

Đặt ảnh vào đúng thư mục này với **đúng tên file** bên dưới, rồi báo Claude ghép vào code.

| Vị trí | Tên file | Tỉ lệ | Kích thước gợi ý | Định dạng |
|---|---|---|---|---|
| Thẻ "Nhiệm vụ" (bạch tuộc) | `tasks.png` | 1:1 | 1024×1024 | PNG/JPG |
| Thẻ "Shadowing" (tai nghe) | `shadowing.png` | 1:1 | 1024×1024 | PNG/JPG |
| Thẻ "Học toán" | `math.png` | 1:1 | 1024×1024 | PNG/JPG |
| Thẻ "Tập gõ phím" | `typing.png` | 1:1 | 1024×1024 | PNG/JPG |
| Background cả trang | `background.png` | 16:9 | 2560×1440 | PNG/JPG |

## Mẹo để 5 ảnh ĐỒNG BỘ phong cách
- Dán chung đoạn STYLE bên dưới vào **mọi** prompt.
- Nếu tool hỗ trợ **seed** (Midjourney `--seed`, hoặc "same style"), dùng cùng một seed cho cả 5 ảnh.
- Yêu cầu **no text / không chữ** trong ảnh (chữ do web tự hiển thị).
- Ảnh thẻ: để **nền mềm sáng, không quá tối** để hợp với thẻ trắng.

---

### STYLE (dán chung cho mọi prompt)
```
soft 3D clay / plasticine render, cute kawaii children's app illustration,
smooth matte clay texture, rounded shapes, pastel color palette
(lavender, mint green, sky blue, soft pink, warm yellow), soft studio
lighting, gentle ambient occlusion, high detail, clean composition,
no text, no words --ar 1:1
```

### 1. tasks.png — Bạch tuộc / việc tốt mỗi ngày
```
A cheerful smiling purple octopus standing in a soft green clay garden,
pointing at a wooden star-chart board with gold stars and checkmarks,
a small gift box nearby, sunny sky. [STYLE]
```

### 2. shadowing.png — Bé đeo tai nghe luyện nói
```
A cute child wearing big headphones singing into a retro microphone on a
stand, colorful sound waves and music notes floating around, cozy pastel
room with a small shelf, playful and happy. [STYLE]
```

### 3. math.png — Học toán
```
Colorful clay math scene: an open workbook, big soft 3D numbers 3 2 5,
geometric shapes (triangle, circle, square), plus and equals signs,
building blocks, on a light pastel desk. [STYLE]
```

### 4. typing.png — Tập gõ phím
```
A child's chubby hands typing on a cute pastel mechanical keyboard with
colorful rounded keycaps, small sparkles and motion lines, soft lavender
background, three-quarter top view. [STYLE]
```

### 5. background.png — Nền cả trang (đổi --ar 16:9)
```
A wide dreamy pastel clay landscape for a kids app background: fluffy soft
3D clouds, tiny stars and music notes floating in a light blue sky, rolling
green clay hills, a few rounded clay trees, an open storybook and stacked
toy blocks resting on the grass in the lower corners, empty calm space in
the middle, soft and airy, no characters, no text --ar 16:9
```
> Lưu ý ảnh nền: chừa **khoảng trống ở giữa** để các thẻ nội dung đọc rõ.

---

## Ảnh cho cấu trúc mới (góc ngôn ngữ + Vườn Toán)

Emoji hiện tại chỉ là tạm. Tạo các ảnh dưới đây, đặt đúng tên vào thư mục này
rồi báo Claude ghép vào code (Claude sẽ đổi ô emoji sang `next/image`).

### A. Thẻ trang chủ (1:1, 1024×1024) — `--ar 1:1`
| Thẻ | Tên file |
|---|---|
| Tiếng Trung | `chinese.png` |
| Tiếng Việt | `vietnamese.png` |
> Tiếng Anh / Nhiệm vụ / Học Toán / Tập gõ phím dùng lại ảnh đã có.

```
chinese.png — A cute smiling panda cub happily holding a round red paper
lantern, a couple of soft rounded Chinese-style rooftops and a floating red
lantern behind, warm friendly mood. [STYLE] --ar 1:1
```
```
vietnamese.png — A cute pink rabbit peeking over three soft storybook picture
cards standing in a row, gentle storytelling scene, warm cream background.
[STYLE] --ar 1:1
```

### B. Ô trong trang góc học (ngang, 16:10) — `--ar 16:10`
| Ô | Tên file |
|---|---|
| Tiếng Anh · Shadowing | `en-shadowing.png` |
| Tiếng Anh · Nghe & chọn | `en-listen.png` |
| Tiếng Trung · Shadowing | `zh-shadowing.png` |
| Tiếng Trung · Nghe & chọn | `zh-listen.png` |
| Tiếng Việt · Nghe hiểu câu chuyện | `vi-story.png` |

```
en-shadowing.png — A cute child wearing big headphones speaking into a retro
microphone on a stand, colorful sound waves and music notes floating, cozy
pastel room. [STYLE] --ar 16:10
```
```
en-listen.png — A cute retro clay speaker emitting soft sound waves toward a
red apple, a yellow rubber duck and a blue toy car in a row, soft pastel
background. [STYLE] --ar 16:10
```
```
zh-shadowing.png — A cute child wearing headphones speaking into a microphone,
a red paper lantern and rounded Chinese rooftop decor in a cozy pastel room,
floating music notes. [STYLE] --ar 16:10
```
```
zh-listen.png — A cute clay speaker emitting soft sound waves toward a panda, a
red paper lantern and a small bamboo steamer of dumplings, soft pastel
background. [STYLE] --ar 16:10
```
```
vi-story.png — A cute pink rabbit peeking over three storybook picture cards in
a row (a seed, a blue watering can, a green sprout), warm gentle storytelling
mood, soft cream background. [STYLE] --ar 16:10
```

### C. Ô trò chơi Vườn Toán (4:3) — `--ar 4:3`
Nền **phẳng pastel nhạt** (hoặc trong suốt) để lọt vào ô có sẵn màu.

| Trò (độ tuổi) | Tên file |
|---|---|
| Phân loại vào rổ (3t) | `math-sort-basket.png` |
| Cái nào hơn? (3t) | `math-compare.png` |
| Tiếp nối dãy (3t) | `math-pattern.png` |
| Hình gì đây? (3t) | `math-shapes.png` |
| Tìm hình trốn (3t) | `math-find.png` |
| Đếm cùng bé (4–5t) | `math-count.png` |
| Xếp theo thứ tự (4–5t) | `math-order.png` |
| Phân loại hình (4–5t) | `math-sort-shape.png` |
| Phiếu bài tập (6–7t) | `math-worksheet.png` |

```
math-sort-basket.png — Three woven baskets with colorful fruit and gold stars
being sorted into them, soft mint background. [STYLE] --ar 4:3
math-compare.png — A big friendly elephant beside a tiny mouse on grass,
showing big vs small, soft warm-yellow background. [STYLE] --ar 4:3
math-pattern.png — A row of fruit forming a pattern: apple, banana, apple,
banana, then one empty blank card, soft pink background. [STYLE] --ar 4:3
math-shapes.png — Four smiling clay geometric shapes: blue circle, yellow
square, green triangle, grey star, soft blue background. [STYLE] --ar 4:3
math-find.png — A little house built of colorful clay blocks with a magnifying
glass searching for a hidden shape, soft mint background. [STYLE] --ar 4:3
math-count.png — Five fluffy yellow ducklings walking in a row on grass, soft
warm-yellow background. [STYLE] --ar 4:3
math-order.png — Five clay sticks in ascending height order like a small bar
chart, soft mint background. [STYLE] --ar 4:3
math-sort-shape.png — Two woven baskets sorting soft clay shapes by type,
circles in one and triangles in the other, soft mint background. [STYLE] --ar 4:3
math-worksheet.png — A clay math worksheet on a clipboard with colorful
counting beads and a pencil, soft lavender background. [STYLE] --ar 4:3
```
