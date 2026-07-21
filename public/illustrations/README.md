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
