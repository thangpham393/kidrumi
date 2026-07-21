# Kidrumi — Design System

Nguồn chuẩn phong cách để **mọi tính năng mới đồng bộ**. Khi thêm màn hình/thành phần
mới: tái sử dụng token + class có sẵn trong [app/globals.css](app/globals.css) trước,
chỉ viết CSS mới khi thật sự cần, và giữ đúng "vibe" bên dưới.

> ## ⚠️ QUY TẮC BẮT BUỘC — Responsive cho MỌI phần mới
> Mỗi màn hình / thành phần / tính năng làm sau này **phải được tối ưu responsive cho
> mobile và tablet ngay khi làm**, không để "làm sau". Cụ thể:
> - Thiết kế **mobile-first**, kiểm đủ 4 mốc: **≥1024 (desktop) · 768 (tablet) · 390
>   (mobile) · 360 (máy nhỏ)**.
> - Tuyệt đối **không tràn ngang**; lưới/nav/bảng phải co gọn (xem breakpoint mục 9).
> - Vùng chạm ≥ 44px; chữ đọc được; keypad/thanh dính đáy chừa `env(safe-area-inset-bottom)`.
> - Chụp kiểm bằng **device emulation** (không tin `--window-size` của headless — xem mục 9).
>
> Xem chưa tối ưu responsive = **chưa xong**. Không merge/commit một phần UI mới nếu chưa
> đạt các mốc trên.

## 1. Tinh thần thiết kế
Vui tươi, mềm mại, tròn trịa, kiểu **đất nặn (clay/plasticine) pastel** cho bé tuổi tiền
tiểu học. Nhiều bo góc lớn, bóng đổ mềm, gradient nhẹ, emoji thân thiện, chuyển động nảy
nhẹ. Không góc cạnh sắc, không màu chói gắt, không đổ bóng cứng/đen.

## 2. Design tokens (CSS variables trong `:root`)
Luôn dùng biến, **không hardcode hex** trừ khi tạo sắc thái mới có chủ đích.

| Nhóm | Biến | Giá trị |
|---|---|---|
| Thương hiệu | `--brand` / `--brand-dark` / `--brand-soft` | `#7c6cf0` / `#6355d8` / `#efecff` |
| Xanh lá | `--green` / `--green-soft` | `#6bbf8a` / `#e6f6ec` |
| Hồng | `--pink` / `--pink-soft` | `#ef7fb0` / `#fdeaf3` |
| Vàng | `--amber` / `--amber-soft` | `#f2b23c` / `#fff4dc` |
| Đỏ/cam (lỗi) | `--red` / `--red-soft` | `#f2795f` / `#ffe9e3` |
| Xanh dương | `--blue` / `--blue-soft` | `#5aa9e6` / `#e4f2fd` |
| Chữ | `--ink` / `--ink-soft` / `--muted` | `#3b3a5a` / `#6f6e90` / `#a3a2bd` |
| Nền/viền | `--card` / `--line` | `#ffffff` / `#ecebf6` |
| Bo góc | `--radius` / `--radius-lg` | `22px` / `30px` |
| Bóng | `--shadow` / `--shadow-sm` | bóng tím mềm (xem file) |

**Quy ước màu theo ngữ nghĩa:** mỗi màu đi kèm bản `-soft` để làm nền trạng thái.
Đúng = green, Sai/xoá = red, Cảnh báo/điểm số = amber, Chủ đạo/chọn = brand.
Phép toán: cộng→green, trừ→red, nhân→brand, chia→blue.

## 3. Typography
- **Tiêu đề / số / nhấn mạnh:** `var(--font-head)` = **Baloo 2** (weight 800). Dùng cho
  `h1–h3`, logo, số liệu, nút `.btn`, biểu thức.
- **Nội dung:** `var(--font-body)` = **Nunito**. Áp cho `body`.
- Font nạp qua `next/font/google` trong [app/layout.tsx](app/layout.tsx) (subsets `latin` +
  `vietnamese`). Luôn hỗ trợ dấu tiếng Việt.
- Tiêu đề trang: `.page-eyebrow` (nhãn nhỏ letter-spacing) + `.page-title`
  (`clamp(30px,5vw,52px)`) + `.page-sub`. Canh giữa.

## 4. Nền trang (scene)
Nền clay 3D dùng chung toàn site: [components/SceneBackground.tsx](components/SceneBackground.tsx)
render `public/illustrations/background.png` phủ kín (`.scene` fixed, `object-position: center
bottom`), làm mờ nhẹ `blur(2px)` + lớp phủ trắng `.scene-veil` (quầng sáng giữa) để nội dung
nổi khối. **Không** đặt nền riêng cho từng trang — mọi nội dung nằm trong `.wrap`
(`z-index:1`) trên nền chung này. Nền tối màu chữ dùng `--ink`.

## 5. Bố cục & khung
- `.wrap`: khung nội dung, `max-width:1360px`, canh giữa, `z-index:1`. Thanh nav
  (`.nav-inner`) rộng hơn một nhịp (`max-width:1440px`) để logo/menu thẳng lề với nội dung.
  Khung rộng này để lưới nhiều cột (vd `.vid-grid` 4 cột) không bị bóp trên màn hình lớn.
- `.panel`: thẻ trắng bo `--radius-lg` + `--shadow`, padding 30px — khối nội dung chính.
- `.grid-2`: lưới 2 cột (desktop), tự về 1 cột ≤900px.
- `.section-label`: nhãn nhóm chữ hoa nhỏ, màu `--muted`.

## 6. Thư viện thành phần (tái dùng, đừng viết lại)
- **Nút chính:** `.btn` (gradient tím, Baloo), `.btn-block` (full width), `.btn-ghost`
  (viền nhạt, nền trắng — hành động phụ).
- **Chip chọn:** `.chip` + `.chip.on` (đơn lựa như phạm vi/số lượng).
- **Pill:** `.pill` + `.pill.on` (bộ lọc, thanh trạng thái).
- **Ô lựa chọn lớn:** `.opt-tile` (+`.on`) trong `.opt-row` — có `.big`/`.t`/`.d`.
- **Thẻ hoạt động (home):** `.act-card` (+ biến thể `.c-task/.c-shad/.c-math/.c-type`),
  gồm `.act-thumb` (ảnh clay), `.act-body` (h3 + `.tag` + p + `.act-cta`), `.tape` (băng keo
  màu). Nghiêng nhẹ + hover nhún (mục 8).
- **Thẻ video (Shadowing):** `.vid` trong lưới `.vid-grid` (4 cột, tự về 2 cột ≤900px),
  gồm `.thumb` (tỉ lệ **16/9**) + `.meta` (h4 + `.badges`). Thumbnail lấy **ảnh video thật
  từ YouTube** (`i.ytimg.com/vi/<id>/hqdefault.jpg`, lỗi thì thử `mqdefault`) qua component
  `VidThumb` ([app/shadowing/page.tsx](app/shadowing/page.tsx)); nếu `youtubeId` không có ảnh
  hợp lệ (YouTube trả ảnh xám 120px) thì **rớt về `.thumb-emoji`** trên nền vàng — luôn có
  fallback, không để vỡ layout. Overlay: `.lvl` (độ khó, dùng lớp `.mid/.hard` đổi màu),
  `.dur` (thời lượng góc phải).
- **Modal:** `.modal-back` (nền mờ) + `.modal` (+ `.x` nút đóng). Biến thể `.result-modal`.
- **Toast:** hook [components/useToast.tsx](components/useToast.tsx) → `.toast` (khen ngợi ngắn).
- **Hộp nhắc:** `.hintbox` (nền amber, hướng dẫn/cảnh báo).
- **Ô nhập:** `.field` (trong form/modal), `.type-input`.
- **Đăng nhập:** `.login-card`, `.google-btn`, `.nav-login` (xem cuối globals.css).

Tạo thành phần mới: kế thừa cùng bo góc (`--radius`/`--radius-lg`), `--shadow`, viền
`--line` 2px, nền `--card`, chữ `--ink`/`--ink-soft`.

## 7. Minh hoạ (illustrations)
- Phong cách **clay 3D pastel** do AI sinh (Midjourney/DALL·E…), **không** vector phẳng.
- Lưu tại [public/illustrations/](public/illustrations/), hiển thị bằng `next/image`
  (`fill` + `sizes` + `object-fit: cover`).
- Prompt chuẩn + quy cách file: [public/illustrations/README.md](public/illustrations/README.md).
  Ảnh mới phải cùng bảng màu pastel, ánh sáng mềm, **no text**, dùng chung seed để đồng bộ.
- Logo: [components/Logo.tsx](components/Logo.tsx) (gấu bông + chữ gradient). Favicon:
  [app/icon.svg](app/icon.svg). Emoji được dùng thoải mái làm icon nhỏ.

## 8. Chuyển động
- Transition mặc định nhanh `.15s`; nảy nhẹ bằng `cubic-bezier(.34,1.56,.64,1)`.
- Mẫu có sẵn: `card-bob` (thẻ nhún khi hover), `result-pop` (modal kết quả), `q-shake`
  (rung khi trả lời sai). Hover nhấc `translateY(-2/-4px)`.
- **Bắt buộc** bọc animation không thiết yếu trong `@media (prefers-reduced-motion: reduce)`
  để tắt cho người nhạy cảm chuyển động (xem các ví dụ trong file).

## 9. Responsive — breakpoints chuẩn
Mobile-first về trải nghiệm; hiện dùng 4 mốc **max-width**:
- **`900px`** — lưới về 1 cột (`.grid-2`, `.task-cols`), video 4→2 cột, thumb nhỏ lại.
- **`820px`** — **nav thành hamburger**: `.nav-links` biến thành dropdown góc phải
  (`.nav-burger` mở/đóng, đổi thành ✕), tên tài khoản dồn về góc phải (`margin-left:auto`).
  Mục chỉ hiện trong menu dùng `.menu-only`; mục chỉ hiện inline dùng `.inline-only`.
- **`720px`** (điện thoại) — **thẻ home 2 cột dọc**: `.act-card` chuyển `flex-direction:
  column`, ảnh trên chữ dưới canh giữa, ẩn mô tả dài + CTA, băng keo canh giữa, tắt nhún
  hover. Bàn phím số (`.pad`) thành **bottom-sheet** trượt lên.
- **`380px`** — tinh chỉnh máy nhỏ (thu chữ, thu keypad).

Nguyên tắc: `overflow-x: clip` ở `html,body` chống tràn ngang; `img/svg/video` luôn
`max-width:100%`; dùng `env(safe-area-inset-bottom)` cho thành phần dính đáy.
**Lưu ý khi test:** headless Chrome đặt `--window-size` KHÔNG bằng layout viewport → phải
dùng device emulation (CDP `Emulation.setDeviceMetricsOverride`) mới chụp đúng khổ mobile.

## 10. Điều hướng (nav)
[components/TopNav.tsx](components/TopNav.tsx): logo trái, 4 mục giữa (desktop), khối tài
khoản phải (avatar + tên + Đăng nhập/Đăng xuất). Trang active tô nền xanh `#d8f0c4`.
≤820px gộp vào hamburger. Thêm mục mới → thêm vào mảng `links` (giữ nhãn tiếng Việt ngắn).

## 11. Giọng văn & nội dung
- **Tiếng Việt**, thân thiện với trẻ, xưng "bé", động viên tích cực ("Giỏi quá!", "Cố lên
  nhé!"). Emoji vừa phải để dẫn dắt.
- Mỗi việc hoàn thành nên có phản hồi vui (toast + sao). Sao lưu qua
  [components/ChildContext.tsx](components/ChildContext.tsx) (localStorage).

## 12. Checklist khi thêm chức năng mới
1. Đặt nội dung trong `.wrap` + `.panel`; mở đầu bằng `.page-title`/`.page-sub`.
2. Dùng token màu + class thành phần có sẵn (mục 2 & 6) trước khi viết CSS mới.
3. Nút chính `.btn`, phụ `.btn-ghost`; trạng thái đúng/sai dùng green/red + bản `-soft`.
4. Minh hoạ mới theo phong cách clay (mục 7), qua `next/image`.
5. **(BẮT BUỘC)** Tối ưu responsive ngay: kiểm 4 breakpoint (≥1024 / 768 / 390 / 360);
   nav & lưới không tràn ngang; vùng chạm ≥44px. Chưa responsive = chưa xong.
6. Animation không thiết yếu bọc `prefers-reduced-motion`.
7. Văn bản tiếng Việt, giọng khích lệ; có phản hồi khi bé làm đúng.
