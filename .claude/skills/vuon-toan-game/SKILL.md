---
name: vuon-toan-game
description: >-
  Dựng một trò chơi / màn học mới cho web KATKID (Vườn Toán, góc Tiếng
  Anh/Trung/Việt…) đúng design-system và stack có sẵn. Bao gồm: tái dùng token +
  class trong app/globals.css, component Emoji (Microsoft Fluent 3D), ChildContext
  (addStars), useToast, celebrate (confetti + âm thanh), speak (Google TTS + rớt
  về giọng trình duyệt); cách tải emoji Fluent 3D còn thiếu; mẫu "vòng chơi"
  tránh lệch hydration; và bộ chụp/kiểm bằng CDP device-emulation. Dùng khi được
  yêu cầu thêm/thiết kế một trò mới, một màn học mới, hay mở một mục "Sắp có"
  trong Vườn Toán.
---

# Dựng trò chơi / màn học mới cho KATKID

Quy trình đã kiểm chứng khi làm trò **"Phân loại vào rổ"** (`app/math/sort`). Mục tiêu:
làm nhanh, **đồng bộ design-system** (đọc `DESIGN.md` trước), tái dùng tối đa, và
**responsive ngay** (chưa responsive = chưa xong — DESIGN.md §9, §12).

> Đây KHÔNG phải Next.js bản thường (xem `AGENTS.md`): đọc guide trong
> `node_modules/next/dist/docs/` trước khi viết gì lạ. App Router, `"use client"`
> cho trang có tương tác/Math.random.

## 0. Nắm yêu cầu + chốt cơ chế
- Trò gì, độ tuổi, **luật thắng** (bao nhiêu lượt/câu → 1 sao? tổng mấy sao?).
  Mẫu "Phân loại vào rổ": 5 lượt, phân loại đúng HẾT một lượt = 1 sao.
- Kho nội dung: tận dụng `app/english/listen/data.ts` (173 từ có sẵn ảnh Fluent 3D
  + nghĩa tiếng Việt) — nguồn emoji "chắc có ảnh" tốt nhất.

## 1. Vị trí file (theo mẫu hiện có)
- Trang trò: `app/<khu>/<ten-tro>/page.tsx` (vd `app/math/sort/page.tsx`) — `"use client"`.
- Dữ liệu: `app/<khu>/<ten-tro>/data.ts` (tách khỏi logic, dễ mở rộng — theo mẫu
  `app/english/listen/data.ts`).
- Mở khoá thẻ ở trang khu: sửa mảng trong `app/math/page.tsx` (hoặc `components/PickGrid.tsx`
  cho các góc ngôn ngữ) — gỡ `soon: true`, thêm `href`.
- CSS: **append** vào cuối `app/globals.css` một khối `/* ==== Tên trò ==== */`
  với tiền tố class riêng (vd `.sort-*`). Không sửa token gốc.

## 2. Tái dùng stack (ĐỪNG viết lại)
| Cần | Dùng |
|---|---|
| Icon 3D đồng bộ mọi máy | `components/Emoji.tsx` → `<Emoji emoji="🧺" className="…" alt="…"/>`. Ảnh ở `public/emoji/<codepoint>.png`; thiếu ảnh tự rớt về emoji hệ thống. |
| Cộng sao (localStorage/CSDL) | `useChild().addStars(n)` — `components/ChildContext.tsx`. |
| Khen ngắn | `useToast()` → `showToast(msg)` + render `{toastEl}`. |
| Confetti + âm thanh | `components/celebrate.ts`: `confettiBurst(x?,y?)`, `playSuccess()`, `playWrong()`. |
| Đọc câu (TTS) | `components/speak.ts`: `speak(text, lang)` — `"en"|"zh"|"vi"`. Ưu tiên Google, tự rớt về giọng trình duyệt. |
| Khung header/sao/prompt/modal kết quả | Tái dùng class `.lt-top` `.pill` `.lt-title` `.lt-replay` `.lt-stars/.lt-star` `.lt-prompt*` `.modal-back/.modal.result-modal/.lt-result`. |
| Nút/chip/panel | `.btn` `.btn-ghost` `.chip` `.pill` `.panel` `.opt-tile` (DESIGN.md §6). |

**TTS tiếng Việt**: giọng Google khai báo ở `app/api/tts/route.ts` (map `VOICES`,
hiện có `en/zh/vi`=`vi-VN-Wavenet-A`). Muốn thêm ngôn ngữ → thêm 1 dòng voice ở đó,
KHÔNG cần đổi client. Key `GOOGLE_TTS_API_KEY` đã có trong `.env.local`; thiếu key
thì route trả 501 và client tự dùng Web Speech.

## 3. Mẫu logic "vòng chơi" (tránh lệch hydration)
- State vòng chơi khởi tạo `null` ở render đầu (kể cả SSR); chỉ gọi hàm dùng
  `Math.random()` trong `useEffect` khi đã mount → tránh mismatch hydration.
- Tương tác kéo-thả cho bé: **Pointer Events** (chuột + cảm ứng chung một mã) +
  `setPointerCapture`; phân biệt "chạm" vs "kéo" bằng ngưỡng ~8px; hỗ trợ luôn
  **chạm 2 bước** (chọn → chạm đích) cho bàn phím/khả dụng. Chip cần `touch-action:none`.
- Đúng → `playSuccess()`+`confettiBurst(x,y)`+`showToast`; sai → `playWrong()` + rung
  nhẹ, **không trừ điểm**. Cộng sao theo đúng luật thắng đã chốt.
- Dùng `useRef` mirror cho state đọc trong handler/timeout (tránh closure cũ khi bé
  thao tác nhanh). Xem `app/math/sort/page.tsx` làm mẫu đầy đủ.

## 4. Emoji Fluent 3D còn thiếu
Kiểm nhanh emoji đã có ảnh chưa, rồi tải cái thiếu:
```bash
node -e 'const fs=require("fs");const S=e=>[...e].map(c=>c.codePointAt(0).toString(16)).filter(h=>h!=="fe0f").join("-");
for(const e of ["🧺","🥦"]){const s=S(e);console.log((fs.existsSync("public/emoji/"+s+".png")?"✓":"✗")+" "+e+" "+s);}'
```
Thiếu → sửa mảng trong `scripts/fetch-fluent-emoji.sh` (map codepoint|Tên-thư-mục|tên_file)
rồi chạy `bash .claude/skills/vuon-toan-game/scripts/fetch-fluent-emoji.sh`.
**Mẹo**: ưu tiên chọn emoji đã có sẵn ảnh để khỏi tải; tránh trộn ảnh 3D với emoji
hệ thống phẳng trong cùng một hàng (nhìn lệch tông).

## 5. Responsive — BẮT BUỘC (DESIGN.md §9)
- Mobile-first + clamp(); kiểm đủ **≥1024 / 768 / 390 / 360**; không tràn ngang; vùng
  chạm ≥44px; thanh dính đáy chừa `env(safe-area-inset-bottom)`.
- Breakpoint chuẩn của repo: `900` (lưới về cột), `820` (nav→hamburger), `720` (điện
  thoại, keypad→bottom-sheet), `380` (máy nhỏ). Animation không thiết yếu bọc
  `@media (prefers-reduced-motion: reduce)`.

## 6. Kiểm thử (không tin `--window-size`)
Dev server thường đã chạy ở `:3000` (Turbopack khoá 1 instance — đừng mở cổng khác).
Chụp đúng khổ bằng **CDP device-emulation**:
```bash
node .claude/skills/vuon-toan-game/scripts/cdp-shot.js http://localhost:3000/math/sort d.png 1280 900 2 0
node .claude/skills/vuon-toan-game/scripts/cdp-shot.js http://localhost:3000/math/sort m360.png 360 780 3 1
```
Đọc file .png để soi layout. **Kiểm tương tác** (kéo/chạm, tính sao, modal) bằng cùng
lối CDP: `Emulation.setDeviceMetricsOverride` → `Input.dispatchMouseEvent`
(mousePressed/mouseMoved/mouseReleased sinh ra pointer events cho React) → đọc DOM qua
`Runtime.evaluate`. Xem `references/interaction-test.md`.

## 7. Chốt hạ
- `npx tsc --noEmit` và `npx eslint <file>` phải sạch.
- Văn bản tiếng Việt, giọng khích lệ ("Giỏi quá!", "Cố lên nhé!"); có phản hồi vui khi
  đúng (toast + sao + confetti). Emoji vừa phải.
- Commit **thẳng vào `main`** (nếp repo — mọi commit gần đây trên main), message tiếng
  Việt ngắn theo mẫu `Khu: tên trò (mô tả ngắn)`, kết thúc bằng dòng
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Chỉ commit/push
  khi người dùng yêu cầu.
