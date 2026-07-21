# Đặc tả chú thích transcript → tiếng Việt (giao cho subagent)

Đưa cho MỖI subagent: (1) đường dẫn file này, (2) BASE_DIR, (3) danh sách VIDEO_IDS, (4) ngôn ngữ nguồn (zh/en).

Với MỖI id: đọc `<BASE>/raw/<id>.json` (mảng `[{t, text}]`) + tiêu đề trong `<BASE>/playlist.json`,
rồi GHI `<BASE>/anno/<id>.json` theo ĐÚNG schema:

```json
{
  "emoji": "<1 emoji đại diện chủ đề>",
  "segments": [
    { "tr": "<dịch tiếng Việt>", "words": [ { "w": "<từ nguyên văn>", "ph": "<phiên âm>", "mean": "<nghĩa VN ngắn>" } ] }
  ]
}
```

## Quy tắc bắt buộc
- `segments` **cùng số lượng & thứ tự** với `raw/<id>.json`. Phần tử i chú thích câu i. KHÔNG thêm/bớt/đổi thứ tự.
- `tr`: dịch tiếng Việt **tự nhiên, thân thiện trẻ mầm non**, xưng hô nhẹ nhàng. Câu lặp dịch nhất quán.
- `words`: 0–3 từ/cụm **đáng chú ý** mỗi câu (danh/động từ chính, màu, con vật…). Bỏ từ tầm thường (的, 了, 我, the, a…). Câu quá đơn giản để `"words": []`.
  - `w` = nguyên văn (phải khớp chữ trong `text`).
  - `ph` = **pinyin có dấu thanh** cho tiếng Trung (vd `shí tou`), **IPA** cho tiếng Anh (vd `ˈhæpi`).
  - `mean` = nghĩa tiếng Việt ngắn.
- `emoji`: 1 emoji hợp chủ đề (mèo → 🐱, màu sắc → 🌈, tuyết → ⛄).
- ASR đôi khi nghe nhầm (vd nhạc hiệu đầu). Vẫn dịch theo text đang có, ĐỪNG sửa text (script khác giữ text). Chỉ cần `tr` hợp lý.
- Chỉ ghi JSON hợp lệ (giữ nguyên chữ Hán & tiếng Việt có dấu). Không in gì thêm.

## Ví dụ (giọng văn)
- `你好！` → `{ "tr": "Xin chào!", "words": [ { "w": "你好", "ph": "nǐ hǎo", "mean": "xin chào" } ] }`
- `我看到石头。` → `{ "tr": "Mình thấy hòn đá.", "words": [ { "w": "石头", "ph": "shí tou", "mean": "hòn đá" }, { "w": "看到", "ph": "kàn dào", "mean": "nhìn thấy" } ] }`
- `Teddy is happy.` → `{ "tr": "Teddy đang vui.", "words": [ { "w": "happy", "ph": "ˈhæpi", "mean": "vui vẻ" } ] }`

Sau khi ghi xong, trả về đúng 1 dòng: `OK <số file đã ghi>`.
