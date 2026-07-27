# Ảnh "thế giới" cho Vườn Nhiệm Vụ

Mỗi bé chọn 1 **thế giới** ở hồ sơ; trang `/tasks` đổi nền + bạn đồng hành theo đó.
Code đã sẵn sàng — chỉ cần bỏ **đúng tên file** vào đúng thư mục là chạy, không sửa code
(xem [app/tasks/worldThemes.ts](../../app/tasks/worldThemes.ts)). Chưa có ảnh thì web tự
rớt về gradient màu + emoji nhún.

## Cần gì cho mỗi thế giới `<key>`
Thư mục: `public/themes/<key>/`

| File | Tỉ lệ | Kích thước | Nền | Vai trò |
|---|---|---|---|---|
| `bg.webp` | 16:9 | 2560×1440 | **đặc** (kín) | Ảnh nền toàn màn (KHÔNG có nhân vật) |
| `swim1.webp … swim4.webp` | 1:1 | 512×512 | **trong suốt (alpha)** | 4 khung "đứng yên" (bồng bềnh) |
| `cheer1.webp … cheer4.webp` | 1:1 | 512×512 | **trong suốt (alpha)** | 4 khung "ăn mừng" khi bé xong việc |

`<key>` gồm: `ocean · space · sunny · valley · race · kingdom · robot · carrot · deepsea`.

> **Tên file `swim`/`cheer` giữ nguyên cho MỌI thế giới** (kể cả trên cạn) — đó chỉ là quy
> ước code: `swim` = vòng lặp đứng-yên, `cheer` = vòng lặp ăn-mừng. Không đổi tên.

## Vì sao mỗi nhân vật cần 8 khung
Web ghép 4 khung thành hoạt hình lật giấy (flipbook) — `swim` 880ms/vòng, `cheer` 500ms/vòng.
Để mượt, **4 khung phải là cùng một nhân vật, cùng cỡ, cùng góc máy, cùng vị trí tâm**, chỉ
đổi *tư thế* nhẹ. Sai lệch cỡ/tâm → nhân vật "giật" khi lật.

---

## QUY TRÌNH SẢN XUẤT (đọc trước khi gen)
1. **Gen ảnh tham chiếu (character sheet) trước** cho từng nhân vật: 1 ảnh, tư thế trung tính,
   chính diện, nền trơn 1 màu. Đây là "DNA" của nhân vật.
2. **Khoá nhân vật** khi gen 8 khung: Midjourney dùng `--cref <url ảnh tham chiếu> --cw 100`
   (character reference) **+ cùng `--seed`**; DALL·E/nano-banana/Flux thì đính ảnh tham chiếu
   và bảo "same character, same colors and proportions, only change the pose".
3. **Nền trong suốt:** ưu tiên tool xuất alpha (nano-banana / Flux + "transparent background",
   hoặc MJ v6 `--style raw` gen trên nền xanh lá `#00b140` rồi tách nền). Đừng để bóng đổ dính
   xuống "sàn" — nhân vật lơ lửng nên bóng phải rời, mờ, tách được.
4. **Đóng khung nhất quán:** thêm vào mọi prompt khung: `full body, centered, facing camera,
   same scale and camera distance across all frames, character fills ~70% of frame,
   feet/base near lower third`.
5. **Xuất & đổi định dạng:**
   - Nhân vật (giữ alpha): `cwebp -q 90 -alpha_q 100 swim1.png -o swim1.webp`
   - Nền (không alpha): `cwebp -q 82 bg.png -o bg.webp`
   - (Chưa có `cwebp`: `brew install webp`.)
6. Bỏ vào `public/themes/<key>/`, mở `/tasks`, chọn đúng thế giới để kiểm.

### STYLE — dán chung cho MỌI prompt
```
soft 3D clay / plasticine render, cute kawaii children's app mascot,
smooth matte clay texture, rounded chunky shapes, big friendly eyes,
pastel color palette, soft studio lighting, gentle ambient occlusion,
high detail, no text, no words
```

### Đuôi khung NHÂN VẬT (dán chung cho 8 khung mỗi nhân vật)
```
[STYLE], full body, single character, centered, facing camera, symmetrical framing,
same scale and camera distance, transparent background, soft detached contact shadow,
--ar 1:1
```
> Thêm `--cref <ref> --cw 100 --seed <n>` (MJ) hoặc đính ảnh tham chiếu (tool khác).

### Vòng lặp TƯ THẾ (áp cho mọi nhân vật — chỉ đổi "chi" cho hợp loài)
"Chi" = xúc tu / vây / tay / cánh / bánh xe / ngọn lửa tuỳ nhân vật.
- **swim1** — nghỉ trung tính, chi buông xuôi, mắt mở, miệng cười nhẹ.
- **swim2** — nhấc lên nhẹ (bồng bềnh), chi xoè ra một chút.
- **swim3** — đỉnh nhịp bồng bềnh, **chớp mắt** (mắt nhắm hí), chi cong ngược lại.
- **swim4** — hạ về, chi thu lại (gương của swim2) → nối mượt về swim1.
- **cheer1** — khựng người xuống, tay/chi bắt đầu giơ, mặt hào hứng.
- **cheer2** — **bật nhảy lên**, chi giơ cao, cười toe, lấp lánh quanh người.
- **cheer3** — đỉnh nhảy, mắt cười híp, vài đốm confetti pastel.
- **cheer4** — rơi xuống, chi dang rộng → nối mượt về cheer1.

---

## 1. `ocean` — Mimo Bạch Tuộc 🐙
**DNA:** `a chubby lavender-purple baby octopus named Mimo, big glossy eyes, rosy
cheeks, eight short rounded tentacles with tiny suckers, tiny pink pearl on its
head`. Tông tím oải hương (khớp màu chủ đạo `#7469ed`).
**bg.webp:**
```
A wide dreamy pastel clay UNDERWATER coral reef scene for a kids app background:
soft rounded coral in lavender mint and pink, gentle god-ray light from above,
floating bubbles, smooth sandy floor with a few rounded shells and starfish in the
lower corners, calm empty water in the middle, no characters, no text
[STYLE] --ar 16:9
```

## 2. `space` — Roki Tên Lửa 🚀
**DNA:** `a cute smiling little clay rocket named Roki, glossy white body with a
purple nose cone and lavender fins, two tiny stubby arms, round cartoon eyes on the
body, a soft puff of pastel flame at the bottom`. Tông tím/tím hồng (`#7867d8`).
> "Chi" khi làm tư thế = hai tay nhỏ + độ dài/xoè của ngọn lửa.
**bg.webp:**
```
A wide dreamy pastel clay OUTER SPACE scene for a kids app background: soft rounded
planets with rings, a chubby crescent moon, scattered twinkling stars and tiny
comets, a swirl of lavender and sky-blue nebula, calm empty space in the middle,
no characters, no text [STYLE] --ar 16:9
```

## 3. `sunny` — Sunny Mặt Trời ☀️
**DNA:** `a happy little clay sun named Sunny, round golden-yellow body with soft
rounded rays, big cheerful eyes, rosy cheeks, two tiny arms`. Tông vàng ấm (`#efa128`).
**bg.webp:**
```
A wide dreamy pastel clay SUNNY MEADOW garden for a kids app background: rolling
soft green hills, a few rounded clay flowers and a small tree in the lower corners,
fluffy pastel clouds, warm golden light, calm empty space in the middle, no
characters, no text [STYLE] --ar 16:9
```

## 4. `valley` — Tí-Rex Dũng Cảm 🦕
**DNA:** `a cute chubby green baby T-rex named Ti-Rex, soft rounded body, tiny arms,
friendly round eyes, small blunt teeth in a happy smile, little cream belly and
back plates`. Tông xanh lá (`#62a95f`).
**bg.webp:**
```
A wide dreamy pastel clay PREHISTORIC VALLEY for a kids app background: rounded
green hills and giant soft ferns, a friendly far-off pastel volcano, a couple of big
smooth boulders and clay eggs in the lower corners, warm hazy light, calm empty
space in the middle, no characters, no text [STYLE] --ar 16:9
```

## 5. `race` — Rubi Xe Đua 🏁
**DNA:** `a cute smiling clay race car named Rubi, glossy red rounded body, big
cartoon headlight eyes on the windshield, number star on the door, soft rounded
wheels, tiny spoiler`. Tông đỏ cam (`#ef6758`).
> "Chi" khi làm tư thế = độ nảy của thân + bánh xe quay + vệt tốc độ nhỏ; "nhảy" = bốc đầu
> (wheelie) vui nhộn.
**bg.webp:**
```
A wide dreamy pastel clay RACE TRACK scene for a kids app background: a smooth winding
pastel road with soft checkered edges, tiny rounded flags and traffic cones in the
lower corners, gentle hills and fluffy clouds, warm cheerful light, calm empty road
in the middle, no characters, no text [STYLE] --ar 16:9
```

## 6. `kingdom` — Công chúa nhỏ 👑
**DNA:** `a cute little clay princess, chubby cheeks, big sparkly eyes, soft pink
gown, tiny golden crown, small wand with a star, warm brown rounded hair`. Tông
hồng/tím (`#e77bb2`).
**bg.webp:**
```
A wide dreamy pastel clay FAIRYTALE KINGDOM for a kids app background: soft rounded
castle towers with pink and lavender roofs in the distance, tiny bunting flags,
rounded topiary bushes in the lower corners, sparkles in the air, calm empty space in
the middle, no characters, no text [STYLE] --ar 16:9
```

## 7. `robot` — Robo Tí Hon 🤖
**DNA:** `a cute tiny clay robot named Robo, rounded sky-blue and white body, big round
screen face with two glowing eyes and a smile, small antenna with a ball, stubby
arms, little tank-tread base`. Tông xanh dương (`#4fa3d8`).
**bg.webp:**
```
A wide dreamy pastel clay ROBOT CITY for a kids app background: rounded pastel
buildings with glowing dots, soft gears and pipes, tiny satellite dishes and blocks in
the lower corners, gentle blue-and-mint light, calm empty space in the middle, no
characters, no text [STYLE] --ar 16:9
```

## 8. `carrot` — Bông Thỏ Hồng 🐰
**DNA:** `a cute chubby pink bunny named Bong, fluffy round body, long soft ears with
pink inner, big shiny eyes, rosy cheeks, holding a tiny orange carrot`. Tông hồng
(`#ec7fae`).
**bg.webp:**
```
A wide dreamy pastel clay VEGETABLE GARDEN for a kids app background: neat rounded
soil rows with leafy carrot tops, a small wooden fence and watering can in the lower
corners, fluffy clouds and a warm sky, calm empty space in the middle, no characters,
no text [STYLE] --ar 16:9
```

## 9. `deepsea` — Mập Xanh 🦈
**DNA:** `a cute chubby baby shark named Map Xanh, glossy teal-blue body, pale belly,
big friendly eyes, tiny rounded teeth in a happy smile, small dorsal and side fins`.
Tông xanh biển đậm (`#3f8fd2`). *(Đây là thế giới ảnh mẫu — nền tàu đắm + rương kho báu.)*
**bg.webp:**
```
A wide dreamy pastel clay DEEP-SEA scene for a kids app background: a sunken wooden
ship on the left, an open treasure chest glowing with gold coins and gems on the
right, soft coral and seaweed, rising bubbles and faint god-rays, deep calm blue water
in the middle, no characters, no text [STYLE] --ar 16:9
```

---

## Kiểm nhanh sau khi bỏ ảnh
- Vào `/tasks`, đổi hồ sơ bé sang từng thế giới → nền + nhân vật đổi theo.
- Tick hết nhiệm vụ → nhân vật chuyển sang bộ khung `cheer` (nhảy mừng).
- Kéo-thả nhân vật → vị trí được nhớ (localStorage).
- Bật "Giảm chuyển động" của hệ điều hành → hạt nền tắt, nhân vật đứng khung 1 (đúng DESIGN.md).
- Chụp kiểm 4 mốc responsive: ≥1024 / 768 / 390 / 360.
```
