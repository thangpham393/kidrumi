// Dữ liệu trò "Nghe hiểu câu chuyện" — 20 truyện chia theo 6 CHƯƠNG (bản đồ học nối
// tiếp nhau). Mỗi truyện là 3–4 bức tranh clay (màu nước) cùng nhân vật Thỏ hồng, cùng
// bối cảnh, chỉ đổi hành động nên các khung khớp nhau tuyệt đối. Bé nghe lời kể (Google
// TTS tiếng Việt) rồi xếp tranh theo đúng thứ tự trước–sau.
// Ảnh tĩnh ở public/illustrations/stories/<id>/<n>.webp (512×512).

export type StoryFrame = {
  n: number;         // 1..N — vị trí đúng của khung
  img: string;
  alt: string;       // mô tả tranh (accessibility)
  line: string;      // lời kể riêng cho khung này — đọc khi bé đặt đúng
};

export type Story = {
  id: string;
  title: string;
  narration: string;         // lời kể cả truyện (đọc đầu mỗi truyện)
  frames: StoryFrame[];      // ĐÃ theo đúng thứ tự (độ dài 3 hoặc 4)
};

export type Chapter = {
  id: string;
  title: string;
  storyIds: string[];        // các truyện thuộc chương, theo thứ tự
};

const frame = (id: string, n: number, alt: string, line: string): StoryFrame => ({
  n,
  img: `/illustrations/stories/${id}/${n}.webp`,
  alt,
  line,
});

export const STORIES: Story[] = [
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
      frame("paint-picture", 3, "Bức tranh mặt trời đã vẽ xong", "Ông mặt trời đã vẽ xong rồi!"),
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
  {
    id: "brush-teeth",
    title: "Đánh răng",
    narration:
      "Thỏ bóp kem lên chiếc bàn chải vàng. Thỏ chải răng thật kỹ, bọt trắng đầy quanh miệng. Súc miệng xong, răng Thỏ sạch bóng.",
    frames: [
      frame("brush-teeth", 1, "Thỏ bóp kem đánh răng lên bàn chải vàng", "Thỏ bóp kem lên chiếc bàn chải vàng."),
      frame("brush-teeth", 2, "Thỏ chải răng, quanh miệng đầy bọt trắng", "Thỏ chải răng thật kỹ, bọt trắng đầy quanh miệng."),
      frame("brush-teeth", 3, "Thỏ cầm cốc súc miệng, răng đã sạch bóng", "Súc miệng xong, răng Thỏ sạch bóng."),
    ],
  },
  {
    id: "wear-coat",
    title: "Mặc áo khoác",
    narration:
      "Áo khoác xanh treo trên móc, ngoài cửa sổ gió thổi. Công Chúa xỏ tay vào áo khoác. Mặc áo xong rồi, Công Chúa ra vườn chơi.",
    frames: [
      frame("wear-coat", 1, "Áo khoác xanh treo trên móc, ngoài cửa sổ lá bay vì gió", "Áo khoác xanh treo trên móc, ngoài cửa sổ gió thổi."),
      frame("wear-coat", 2, "Công Chúa xỏ một tay vào áo khoác, vạt kia còn mở", "Công Chúa xỏ tay vào áo khoác."),
      frame("wear-coat", 3, "Công Chúa mặc áo khoác cài khuy, dang tay ngoài vườn", "Mặc áo xong rồi, Công Chúa ra vườn chơi."),
    ],
  },
  {
    id: "make-sandwich",
    title: "Làm bánh mì kẹp",
    narration:
      "Bánh mì, xà lách và cà chua để trên ba đĩa. Khủng Long xếp xà lách và cà chua lên bánh. Đậy lát bánh lên trên, bánh mì kẹp xong rồi.",
    frames: [
      frame("make-sandwich", 1, "Ba đĩa riêng: lát bánh mì, xà lách và cà chua", "Bánh mì, xà lách và cà chua để trên ba đĩa."),
      frame("make-sandwich", 2, "Khủng Long xếp xà lách và cà chua lên lát bánh, chưa đậy nắp", "Khủng Long xếp xà lách và cà chua lên bánh."),
      frame("make-sandwich", 3, "Chiếc bánh mì kẹp đã đậy lát bánh trên, nhân lộ ra ở cạnh", "Đậy lát bánh lên trên, bánh mì kẹp xong rồi."),
    ],
  },
  {
    id: "give-present",
    title: "Tặng quà cho bạn",
    narration:
      "Thỏ gói món quà bằng giấy xanh. Thỏ trao hộp quà cho Công Chúa. Mở hộp ra, bên trong là một chú gấu bông.",
    frames: [
      frame("give-present", 1, "Thỏ ngồi bên hộp quà xanh vừa gói xong, cuộn giấy còn bên cạnh", "Thỏ gói món quà bằng giấy xanh."),
      frame("give-present", 2, "Thỏ trao hộp quà cho Công Chúa, hai bạn cùng cầm", "Thỏ trao hộp quà cho Công Chúa."),
      frame("give-present", 3, "Hộp quà đã mở, một chú gấu bông nâu nhô lên", "Mở hộp ra, bên trong là một chú gấu bông."),
    ],
  },
  {
    id: "fix-kite",
    title: "Sửa chiếc diều",
    narration:
      "Chiếc diều đỏ của Rô-bốt bị rách một mảng. Rô-bốt vá lại chỗ rách bằng một miếng vải. Chiếc diều lại bay cao trên trời xanh.",
    frames: [
      frame("fix-kite", 1, "Rô-bốt cầm con diều đỏ bị rách một mảng", "Chiếc diều đỏ của Rô-bốt bị rách một mảng."),
      frame("fix-kite", 2, "Con diều đã được vá, có một miếng vá vuông màu kem", "Rô-bốt vá lại chỗ rách bằng một miếng vải."),
      frame("fix-kite", 3, "Diều bay cao trên trời, Rô-bốt cầm cuộn dây nhìn theo", "Chiếc diều lại bay cao trên trời xanh."),
    ],
  },
  {
    id: "feed-birds",
    title: "Cho chim ăn",
    narration:
      "Mấy chú chim đậu chờ trên hàng rào. Công Chúa rắc những hạt nhỏ xuống đất. Đàn chim bay xuống, cùng nhau mổ hạt.",
    frames: [
      frame("feed-birds", 1, "Ba chú chim đậu trên hàng rào, Công Chúa cầm túi hạt còn đóng", "Mấy chú chim đậu chờ trên hàng rào."),
      frame("feed-birds", 2, "Công Chúa chìa tay rắc hạt, hạt rơi thành dòng xuống đất", "Công Chúa rắc những hạt nhỏ xuống đất."),
      frame("feed-birds", 3, "Ba chú chim đã xuống đất, cúi đầu mổ hạt", "Đàn chim bay xuống, cùng nhau mổ hạt."),
    ],
  },
  {
    id: "pack-school-bag",
    title: "Chuẩn bị cặp đi học",
    narration:
      "Sách và hộp bút nằm cạnh chiếc cặp còn trống. Khủng Long bỏ từng quyển sách vào cặp. Khủng Long đậy nắp cặp lại. Cặp đã lên lưng, Khủng Long sẵn sàng đi học.",
    frames: [
      frame("pack-school-bag", 1, "Sách và hộp bút nằm trên thảm cạnh chiếc cặp xanh mở rỗng", "Sách và hộp bút nằm cạnh chiếc cặp còn trống."),
      frame("pack-school-bag", 2, "Khủng Long cúi xuống bỏ quyển sách vào trong cặp đang mở", "Khủng Long bỏ từng quyển sách vào cặp."),
      frame("pack-school-bag", 3, "Chiếc cặp đã đóng kín, Khủng Long đứng thẳng nắm quai cặp", "Khủng Long đậy nắp cặp lại."),
      frame("pack-school-bag", 4, "Khủng Long đeo cặp trên lưng, sàn nhà đã sạch đồ", "Cặp đã lên lưng, Khủng Long sẵn sàng đi học."),
    ],
  },
  {
    id: "plant-young-tree",
    title: "Trồng cây non",
    narration:
      "Rô-bốt đào một chiếc hố nhỏ. Rô-bốt đặt cây non xuống hố. Rô-bốt xúc đất lấp quanh gốc cây. Cuối cùng, Rô-bốt tưới nước cho cây.",
    frames: [
      frame("plant-young-tree", 1, "Rô-bốt cầm xẻng, trước mặt là chiếc hố tròn đã đào xong", "Rô-bốt đào một chiếc hố nhỏ."),
      frame("plant-young-tree", 2, "Rô-bốt bưng cây non có bầu rễ, hạ xuống hố", "Rô-bốt đặt cây non xuống hố."),
      frame("plant-young-tree", 3, "Cây non đứng thẳng, Rô-bốt dùng xẻng vun đất quanh gốc", "Rô-bốt xúc đất lấp quanh gốc cây."),
      frame("plant-young-tree", 4, "Rô-bốt cầm bình xanh tưới nước cho cây non", "Cuối cùng, Rô-bốt tưới nước cho cây."),
    ],
  },
  {
    id: "make-clay-bowl",
    title: "Làm chiếc bát đất nặn",
    narration:
      "Bạch Tuộc có một cục đất nặn tròn. Bạch Tuộc lăn đất thành một cuộn dây dài. Cuộn dây thành chiếc bát có lòng sâu. Cuối cùng, Bạch Tuộc gắn những chấm vàng quanh bát.",
    frames: [
      frame("make-clay-bowl", 1, "Bạch Tuộc ôm một cục đất nặn tròn trơn", "Bạch Tuộc có một cục đất nặn tròn."),
      frame("make-clay-bowl", 2, "Cục đất đã lăn thành cuộn dây dài, cuốn lại thành vòng", "Bạch Tuộc lăn đất thành một cuộn dây dài."),
      frame("make-clay-bowl", 3, "Chiếc bát đã thành hình, miệng tròn và lòng bát sâu", "Cuộn dây thành chiếc bát có lòng sâu."),
      frame("make-clay-bowl", 4, "Chiếc bát có một hàng chấm tròn màu vàng quanh thân", "Cuối cùng, Bạch Tuộc gắn những chấm vàng quanh bát."),
    ],
  },
  {
    id: "make-paper-boat",
    title: "Làm thuyền giấy",
    narration:
      "Công Chúa cầm một tờ giấy xanh phẳng. Công Chúa gấp tờ giấy thành hình tam giác. Chiếc thuyền giấy đã gấp xong, đặt trên bàn. Công Chúa thả thuyền xuống dòng suối.",
    frames: [
      frame("make-paper-boat", 1, "Công Chúa cầm tờ giấy xanh vuông còn phẳng", "Công Chúa cầm một tờ giấy xanh phẳng."),
      frame("make-paper-boat", 2, "Tờ giấy đã gấp đôi thành hình tam giác", "Công Chúa gấp tờ giấy thành hình tam giác."),
      frame("make-paper-boat", 3, "Chiếc thuyền giấy xanh gấp xong, đặt trên mặt bàn", "Chiếc thuyền giấy đã gấp xong, đặt trên bàn."),
      frame("make-paper-boat", 4, "Công Chúa thả thuyền giấy xuống dòng suối, thuyền nổi trên nước", "Công Chúa thả thuyền xuống dòng suối."),
    ],
  },
  {
    id: "wash-clothes",
    title: "Giặt quần áo",
    narration:
      "Áo quần lấm bẩn nằm trong giỏ. Rô-bốt cho quần áo vào máy giặt. Quần áo sạch phơi trên dây ngoài nắng. Khô rồi, Rô-bốt gấp quần áo gọn gàng.",
    frames: [
      frame("wash-clothes", 1, "Áo đỏ, quần xanh và tất vàng lấm bẩn nằm trong giỏ", "Áo quần lấm bẩn nằm trong giỏ."),
      frame("wash-clothes", 2, "Rô-bốt cho quần áo bẩn vào máy giặt đang mở cửa", "Rô-bốt cho quần áo vào máy giặt."),
      frame("wash-clothes", 3, "Quần áo sạch phơi trên dây ngoài nắng, giỏ đã trống", "Quần áo sạch phơi trên dây ngoài nắng."),
      frame("wash-clothes", 4, "Rô-bốt gấp quần áo khô thành chồng gọn trên bàn", "Khô rồi, Rô-bốt gấp quần áo gọn gàng."),
    ],
  },
  {
    id: "go-picnic",
    title: "Đi dã ngoại",
    narration:
      "Thỏ và Khủng Long chuẩn bị giỏ với tấm thảm. Hai bạn xếp bánh mì và táo vào giỏ. Hai bạn xách giỏ đi trên đường đến công viên. Thảm đã trải, hai bạn cùng nhau ăn ngon lành.",
    frames: [
      frame("go-picnic", 1, "Thỏ và Khủng Long bên chiếc giỏ trống và tấm thảm đỏ gấp", "Thỏ và Khủng Long chuẩn bị giỏ với tấm thảm."),
      frame("go-picnic", 2, "Hai bạn xếp bánh mì kẹp và táo đỏ vào giỏ", "Hai bạn xếp bánh mì và táo vào giỏ."),
      frame("go-picnic", 3, "Hai bạn xách giỏ đi trên con đường mòn giữa cây xanh", "Hai bạn xách giỏ đi trên đường đến công viên."),
      frame("go-picnic", 4, "Thảm đã trải dưới gốc cây, hai bạn ngồi ăn bánh và táo", "Thảm đã trải, hai bạn cùng nhau ăn ngon lành."),
    ],
  },
  {
    id: "build-snowman",
    title: "Làm người tuyết",
    narration:
      "Khủng Long lăn một quả cầu tuyết thật to. Khủng Long đặt quả cầu nhỏ lên trên. Khủng Long gắn hai cành cây làm tay. Người tuyết đội mũ len, quàng khăn đỏ thật đẹp.",
    frames: [
      frame("build-snowman", 1, "Khủng Long lăn một quả cầu tuyết thật to trên sân", "Khủng Long lăn một quả cầu tuyết thật to."),
      frame("build-snowman", 2, "Quả cầu nhỏ đã đặt chồng lên quả to thành hai tầng", "Khủng Long đặt quả cầu nhỏ lên trên."),
      frame("build-snowman", 3, "Người tuyết đã có hai cành cây làm tay hai bên", "Khủng Long gắn hai cành cây làm tay."),
      frame("build-snowman", 4, "Người tuyết đội mũ len xanh, quàng khăn đỏ, có mũi cà rốt", "Người tuyết đội mũ len, quàng khăn đỏ thật đẹp."),
    ],
  },
  {
    id: "butterfly-grows",
    title: "Bướm lớn lên",
    narration:
      "Một quả trứng nhỏ nằm trên chiếc lá xanh. Sâu bướm chui ra và ăn lá. Sâu bướm hóa thành một chiếc nhộng treo trên cành. Một chú bướm xinh đẹp bay ra.",
    frames: [
      frame("butterfly-grows", 1, "Một quả trứng trắng nhỏ nằm trên chiếc lá xanh", "Một quả trứng nhỏ nằm trên chiếc lá xanh."),
      frame("butterfly-grows", 2, "Sâu bướm xanh bò trên lá, mép lá đã bị ăn khuyết", "Sâu bướm chui ra và ăn lá."),
      frame("butterfly-grows", 3, "Chiếc nhộng xanh treo lủng lẳng dưới cành cây", "Sâu bướm hóa thành một chiếc nhộng treo trên cành."),
      frame("butterfly-grows", 4, "Chú bướm cam xanh bay lên, vỏ nhộng rỗng còn treo lại", "Một chú bướm xinh đẹp bay ra."),
    ],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    title: "Việc của bé",
    storyIds: ["wash-hands", "tidy-toys", "build-tower"],
  },
  {
    id: "ch2",
    title: "Bé sáng tạo",
    storyIds: ["paint-picture", "plant-seed", "rainy-day"],
  },
  {
    id: "ch3",
    title: "Bé làm từng bước",
    storyIds: ["brush-teeth", "wear-coat", "make-sandwich"],
  },
  {
    id: "ch4",
    title: "Bé và bạn bè",
    storyIds: ["give-present", "fix-kite", "feed-birds"],
  },
  {
    id: "ch5",
    title: "Bốn bước đầu tiên",
    storyIds: ["pack-school-bag", "plant-young-tree", "make-clay-bowl", "make-paper-boat"],
  },
  {
    id: "ch6",
    title: "Hành trình dài hơn",
    storyIds: ["wash-clothes", "go-picnic", "build-snowman", "butterfly-grows"],
  },
];

// Thứ tự tuyến tính toàn bộ (để mở khoá dần + tìm 'truyện tiếp theo').
export const STORY_ORDER: string[] = ["wash-hands", "tidy-toys", "build-tower", "paint-picture", "plant-seed", "rainy-day", "brush-teeth", "wear-coat", "make-sandwich", "give-present", "fix-kite", "feed-birds", "pack-school-bag", "plant-young-tree", "make-clay-bowl", "make-paper-boat", "wash-clothes", "go-picnic", "build-snowman", "butterfly-grows"];

export const storyById = (id: string): Story | undefined =>
  STORIES.find((s) => s.id === id);

export const chapterOfStory = (id: string): Chapter | undefined =>
  CHAPTERS.find((c) => c.storyIds.includes(id));

export const INSTRUCTION = "Nghe rồi xếp các tranh theo đúng thứ tự trước–sau nhé!";
export const LISTEN_LABEL = "Nghe câu chuyện";
export const PRAISES = [
  "Giỏi quá!", "Đúng rồi!", "Tuyệt vời!", "Xuất sắc!", "Bé làm tốt lắm!",
];
