// Dữ liệu trò "Nghe hiểu câu chuyện" — mỗi truyện là 3 bức tranh clay (màu nước) cùng
// nhân vật Thỏ hồng, cùng bối cảnh, chỉ đổi hành động nên 3 khung khớp nhau tuyệt đối.
// Bé nghe lời kể (Google TTS tiếng Việt) rồi xếp 3 tranh theo đúng thứ tự trước–sau.
// Ảnh tĩnh ở public/illustrations/stories/<id>/<1|2|3>.webp (512×512).

export type StoryFrame = {
  n: 1 | 2 | 3;
  img: string;
  alt: string; // mô tả tranh (accessibility)
  line: string; // lời kể riêng cho khung này — đọc khi bé đặt đúng
};

export type Story = {
  id: string;
  title: string;
  narration: string; // lời kể cả truyện (đọc đầu mỗi câu)
  frames: [StoryFrame, StoryFrame, StoryFrame]; // ĐÃ theo đúng thứ tự
};

const frame = (id: string, n: 1 | 2 | 3, alt: string, line: string): StoryFrame => ({
  n,
  img: `/illustrations/stories/${id}/${n}.webp`,
  alt,
  line,
});

export const STORIES: Story[] = [
  {
    id: "tidy-toys",
    title: "Dọn đồ chơi",
    narration:
      "Đồ chơi nằm bừa trên thảm. Thỏ bỏ từng món đồ chơi vào hộp. Thảm sạch rồi, hộp đầy đồ chơi.",
    frames: [
      frame("tidy-toys", 1, "Đồ chơi nằm bừa trên thảm, hộp còn trống", "Đồ chơi nằm bừa trên thảm."),
      frame("tidy-toys", 2, "Thỏ bỏ từng món đồ chơi vào hộp tím", "Thỏ bỏ từng món đồ chơi vào hộp."),
      frame("tidy-toys", 3, "Thảm đã sạch, hộp đầy đồ chơi", "Thảm sạch rồi, hộp đầy đồ chơi."),
    ],
  },
  {
    id: "plant-seed",
    title: "Gieo hạt",
    narration:
      "Thỏ bỏ một hạt nhỏ vào chậu đất. Thỏ tưới nước cho chậu bằng bình xanh. Một mầm xanh nhú lên, Thỏ vui lắm.",
    frames: [
      frame("plant-seed", 1, "Thỏ thả một hạt nhỏ vào chậu đất", "Thỏ bỏ một hạt nhỏ vào chậu đất."),
      frame("plant-seed", 2, "Thỏ tưới nước vào chậu bằng bình xanh", "Thỏ tưới nước cho chậu bằng bình xanh."),
      frame("plant-seed", 3, "Một mầm xanh nhú lên khỏi chậu", "Một mầm xanh nhú lên, Thỏ vui lắm."),
    ],
  },
  {
    id: "wash-hands",
    title: "Rửa tay",
    narration:
      "Tay Thỏ dính đầy bùn. Thỏ rửa tay với xà phòng thật nhiều bọt. Tay đã sạch, Thỏ lau khô bằng khăn vàng.",
    frames: [
      frame("wash-hands", 1, "Hai bàn tay Thỏ dính đầy bùn", "Tay Thỏ dính đầy bùn."),
      frame("wash-hands", 2, "Thỏ rửa tay dưới vòi nước với bọt xà phòng", "Thỏ rửa tay với xà phòng thật nhiều bọt."),
      frame("wash-hands", 3, "Thỏ lau tay bằng khăn vàng, tay đã sạch", "Tay đã sạch, Thỏ lau khô bằng khăn vàng."),
    ],
  },
  {
    id: "build-tower",
    title: "Xây tháp",
    narration:
      "Các khối gỗ nằm rời trên thảm. Thỏ xếp từng khối chồng lên nhau. Tháp đã cao xong rồi, Thỏ cười thật vui.",
    frames: [
      frame("build-tower", 1, "Các khối gỗ nằm rời trên thảm", "Các khối gỗ nằm rời trên thảm."),
      frame("build-tower", 2, "Thỏ xếp từng khối chồng lên nhau", "Thỏ xếp từng khối chồng lên nhau."),
      frame("build-tower", 3, "Tháp khối đã cao, Thỏ đứng cười", "Tháp đã cao xong rồi, Thỏ cười thật vui."),
    ],
  },
  {
    id: "paint-picture",
    title: "Vẽ tranh",
    narration:
      "Tờ giấy còn trắng, Thỏ cầm cọ vẽ. Thỏ vẽ một vòng tròn vàng. Ông mặt trời đã vẽ xong rồi!",
    frames: [
      frame("paint-picture", 1, "Tờ giấy trắng trên giá vẽ, Thỏ cầm cọ", "Tờ giấy còn trắng, Thỏ cầm cọ vẽ."),
      frame("paint-picture", 2, "Thỏ vẽ một vòng tròn vàng lên giấy", "Thỏ vẽ một vòng tròn vàng."),
      frame("paint-picture", 3, "Bức tranh ông mặt trời đã vẽ xong", "Ông mặt trời đã vẽ xong rồi!"),
    ],
  },
  {
    id: "rainy-day",
    title: "Trời mưa",
    narration:
      "Mây đen kéo đến, trời sắp mưa. Thỏ bung chiếc ô đỏ ra. Thỏ cầm ô đi qua những vũng nước.",
    frames: [
      frame("rainy-day", 1, "Mây đen kéo đến, chiếc ô còn khép bên cạnh Thỏ", "Mây đen kéo đến, trời sắp mưa."),
      frame("rainy-day", 2, "Thỏ đang bung chiếc ô đỏ ra", "Thỏ bung chiếc ô đỏ ra."),
      frame("rainy-day", 3, "Thỏ cầm ô đi trên đường đầy vũng nước", "Thỏ cầm ô đi qua những vũng nước."),
    ],
  },
];

export const ROUNDS = STORIES.length; // 6 truyện = 6 sao

export const INSTRUCTION = "Bé hãy xếp tranh theo thứ tự câu chuyện nhé";
export const LISTEN_LABEL = "Nghe câu chuyện nhé";

export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Bé nghe kỹ ghê!",
  "Tuyệt lắm!",
  "Chính xác!",
  "Bé thật giỏi!",
];
