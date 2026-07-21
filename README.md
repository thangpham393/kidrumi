# 🧸 Kidrumi

**Không gian học vui của bé** — webapp học tập cho các bé tuổi tiền tiểu học.

Tên **Kidrumi** ghép từ *kid* + *amigurumi* (thú bông đáng yêu). Linh vật: chú gấu bông 🧸.

## Tính năng

| Trang | Mô tả |
|---|---|
| 🏠 Trang chủ | 4 góc học, chọn hoạt động |
| 🐙 Nhiệm vụ | Tạo hồ sơ bé (chọn "thế giới"), danh sách việc tốt mỗi ngày, tích sao, thanh tiến trình + bạn đồng hành |
| 🎧 Shadowing | Thư viện video tiếng Anh có bộ lọc theo nguồn & độ khó |
| 🧮 Học toán | Phiếu bài tập cộng/trừ/nhân/chia — chọn phạm vi, số lượng, chấm ngay/chấm cuối, có bàn phím số |
| ⌨️ Tập gõ phím | Luyện gõ 10 ngón (Tiếng Việt Telex / English), đo tốc độ & độ chính xác |

Hồ sơ bé và số sao được lưu ở `localStorage` (chưa có backend).

## Công nghệ

- **Next.js 16** (App Router) + **TypeScript**
- CSS thuần (design system pastel trong `app/globals.css`)
- Font `Baloo 2` + `Nunito` qua `next/font`

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
```

## Cấu trúc

```
app/
  layout.tsx        # font + nav + provider
  globals.css       # design system
  page.tsx          # trang chủ
  tasks/            # nhiệm vụ
  shadowing/        # shadowing
  math/             # học toán
  typing/           # tập gõ phím
components/
  TopNav.tsx        # thanh điều hướng
  ChildContext.tsx  # hồ sơ bé + sao (localStorage)
  useToast.tsx      # thông báo nhỏ
```

## Hướng phát triển tiếp

- [ ] Backend + đăng nhập nhiều bé, đồng bộ nhiều thiết bị
- [ ] Trình phát video shadowing thật (ghi âm, so khớp phát âm)
- [ ] Ba mẹ tự thêm/sửa danh sách nhiệm vụ
- [ ] Rương quà, huy hiệu, lịch sử tiến bộ
