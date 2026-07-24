# Emoji icons — Microsoft Fluent Emoji (3D)

Bộ icon dùng cho trò "Nghe & chọn" ([app/english/listen](../../app/english/listen),
[app/chinese/listen](../../app/chinese/listen)). Dùng ảnh 3D để **mọi thiết bị**
(Android/Windows/Mac) đều thấy icon giống nhau, thay vì emoji hệ thống mỗi máy một kiểu.

- **Nguồn:** [microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji) —
  giấy phép **MIT**, được phép nhúng/phân phối.
- **Tên file:** codepoint hệ 16 của emoji, bỏ `FE0F`, nối bằng `-` (kiểu Twemoji).
  Ví dụ `🍎` → `1f34e.png`, `1️⃣` → `31-20e3.png`.
- **Render:** [components/Emoji.tsx](../../components/Emoji.tsx) tính tên file từ ký tự
  emoji; thiếu ảnh thì tự rớt về emoji hệ thống.

## Thêm/cập nhật icon
Emoji mới thêm vào `data.ts` sẽ tự rớt về emoji hệ thống nếu chưa có ảnh ở đây.
Để tải ảnh Fluent 3D cho các emoji mới, chạy lại script tải trong scratchpad
(`fetch-emoji.js`) — nó gom emoji duy nhất từ 2 file data, khớp tên qua emojibase +
GitHub tree của fluentui-emoji, rồi tải PNG về thư mục này.
