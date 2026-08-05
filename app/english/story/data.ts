// Dữ liệu trò "Story in Order" — bản TIẾNG ANH của "Nghe hiểu câu chuyện".
// Cùng 20 truyện / 6 chương và DÙNG CHUNG bộ tranh clay ở
// public/illustrations/stories/<id>/<n>.webp (512×512) với bản tiếng Việt
// (app/vietnamese/story/data.ts) — chỉ khác lời kể: tiếng Anh, câu ngắn, thì hiện tại,
// từ vựng quen thuộc với bé tiền tiểu học. Bé nghe (Google TTS giọng Anh) rồi xếp tranh
// theo đúng thứ tự trước–sau.

export type StoryFrame = {
  n: number;         // 1..N — vị trí đúng của khung
  img: string;
  alt: string;       // mô tả tranh (accessibility) — tiếng Việt cho ba mẹ/đọc màn hình
  line: string;      // lời kể tiếng Anh riêng cho khung này — đọc khi bé đặt đúng
};

export type Story = {
  id: string;
  title: string;             // tên truyện (tiếng Anh)
  titleVi: string;           // tên tiếng Việt — chú thích nhỏ cho bé chưa đọc được
  narration: string;         // lời kể cả truyện (đọc đầu mỗi truyện)
  frames: StoryFrame[];      // ĐÃ theo đúng thứ tự (độ dài 3 hoặc 4)
};

export type Chapter = {
  id: string;
  title: string;             // tên chương (tiếng Anh)
  titleVi: string;
  storyIds: string[];        // các truyện thuộc chương, theo thứ tự
};

// Ảnh dùng chung với bản tiếng Việt — không nhân bản file.
const frame = (id: string, n: number, alt: string, line: string): StoryFrame => ({
  n,
  img: `/illustrations/stories/${id}/${n}.webp`,
  alt,
  line,
});

export const STORIES: Story[] = [
  {
    id: "wash-hands",
    title: "Wash Your Hands",
    titleVi: "Rửa tay",
    narration:
      "Bunny's hands are all muddy. Bunny washes them with lots of soap bubbles. Now the hands are clean, and Bunny dries them with a yellow towel.",
    frames: [
      frame("wash-hands", 1, "Hai bàn tay Thỏ dính đầy bùn", "Bunny's hands are all muddy."),
      frame("wash-hands", 2, "Thỏ rửa tay dưới vòi nước với bọt xà phòng", "Bunny washes them with lots of soap bubbles."),
      frame("wash-hands", 3, "Thỏ lau tay bằng khăn vàng, tay đã sạch", "Now the hands are clean, and Bunny dries them with a yellow towel."),
    ],
  },
  {
    id: "tidy-toys",
    title: "Tidy Up the Toys",
    titleVi: "Dọn đồ chơi",
    narration:
      "Toys are all over the rug. Bunny puts every toy into the box. The rug is clean now, and the box is full of toys.",
    frames: [
      frame("tidy-toys", 1, "Đồ chơi nằm bừa trên thảm, hộp còn trống", "Toys are all over the rug."),
      frame("tidy-toys", 2, "Thỏ bỏ từng món đồ chơi vào hộp tím", "Bunny puts every toy into the box."),
      frame("tidy-toys", 3, "Thảm đã sạch, hộp đầy đồ chơi", "The rug is clean now, and the box is full of toys."),
    ],
  },
  {
    id: "build-tower",
    title: "Build a Tower",
    titleVi: "Xây tháp",
    narration:
      "The wooden blocks lie on the rug. Bunny stacks the blocks one by one. The tower is tall, and Bunny smiles.",
    frames: [
      frame("build-tower", 1, "Các khối gỗ nằm rời trên thảm", "The wooden blocks lie on the rug."),
      frame("build-tower", 2, "Thỏ xếp từng khối chồng lên nhau", "Bunny stacks the blocks one by one."),
      frame("build-tower", 3, "Tháp khối đã cao, Thỏ đứng cười", "The tower is tall, and Bunny smiles."),
    ],
  },
  {
    id: "paint-picture",
    title: "Paint a Picture",
    titleVi: "Vẽ tranh",
    narration:
      "The paper is white, and Bunny holds a brush. Bunny paints a big yellow circle. The sunny picture is finished!",
    frames: [
      frame("paint-picture", 1, "Tờ giấy trắng trên giá vẽ, Thỏ cầm cọ", "The paper is white, and Bunny holds a brush."),
      frame("paint-picture", 2, "Thỏ vẽ một vòng tròn vàng lên giấy", "Bunny paints a big yellow circle."),
      frame("paint-picture", 3, "Bức tranh mặt trời đã vẽ xong", "The sunny picture is finished!"),
    ],
  },
  {
    id: "plant-seed",
    title: "Plant a Seed",
    titleVi: "Gieo hạt",
    narration:
      "Bunny drops a little seed into the pot. Bunny waters the pot with a blue can. A green sprout comes up, and Bunny is so happy.",
    frames: [
      frame("plant-seed", 1, "Thỏ thả một hạt nhỏ vào chậu đất", "Bunny drops a little seed into the pot."),
      frame("plant-seed", 2, "Thỏ tưới nước vào chậu bằng bình xanh", "Bunny waters the pot with a blue can."),
      frame("plant-seed", 3, "Một mầm xanh nhú lên khỏi chậu", "A green sprout comes up, and Bunny is so happy."),
    ],
  },
  {
    id: "rainy-day",
    title: "A Rainy Day",
    titleVi: "Trời mưa",
    narration:
      "Dark clouds come, and it is going to rain. Bunny opens the red umbrella. Bunny walks past the puddles with the umbrella.",
    frames: [
      frame("rainy-day", 1, "Mây đen kéo đến, chiếc ô còn khép bên cạnh Thỏ", "Dark clouds come, and it is going to rain."),
      frame("rainy-day", 2, "Thỏ đang bung chiếc ô đỏ ra", "Bunny opens the red umbrella."),
      frame("rainy-day", 3, "Thỏ cầm ô đi trên đường đầy vũng nước", "Bunny walks past the puddles with the umbrella."),
    ],
  },
  {
    id: "brush-teeth",
    title: "Brush Your Teeth",
    titleVi: "Đánh răng",
    narration:
      "Bunny puts toothpaste on the yellow brush. Bunny brushes and brushes, with white foam around the mouth. After rinsing, Bunny's teeth are shiny and clean.",
    frames: [
      frame("brush-teeth", 1, "Thỏ bóp kem đánh răng lên bàn chải vàng", "Bunny puts toothpaste on the yellow brush."),
      frame("brush-teeth", 2, "Thỏ chải răng, quanh miệng đầy bọt trắng", "Bunny brushes and brushes, with white foam around the mouth."),
      frame("brush-teeth", 3, "Thỏ cầm cốc súc miệng, răng đã sạch bóng", "After rinsing, Bunny's teeth are shiny and clean."),
    ],
  },
  {
    id: "wear-coat",
    title: "Put On a Coat",
    titleVi: "Mặc áo khoác",
    narration:
      "The blue coat hangs on the hook, and the wind blows outside. Princess slides one arm into the coat. The coat is on, and Princess goes out to the garden.",
    frames: [
      frame("wear-coat", 1, "Áo khoác xanh treo trên móc, ngoài cửa sổ lá bay vì gió", "The blue coat hangs on the hook, and the wind blows outside."),
      frame("wear-coat", 2, "Công Chúa xỏ một tay vào áo khoác, vạt kia còn mở", "Princess slides one arm into the coat."),
      frame("wear-coat", 3, "Công Chúa mặc áo khoác cài khuy, dang tay ngoài vườn", "The coat is on, and Princess goes out to the garden."),
    ],
  },
  {
    id: "make-sandwich",
    title: "Make a Sandwich",
    titleVi: "Làm bánh mì kẹp",
    narration:
      "Bread, lettuce, and tomato sit on three plates. Dino puts the lettuce and tomato on the bread. The top slice goes on, and the sandwich is ready.",
    frames: [
      frame("make-sandwich", 1, "Ba đĩa riêng: lát bánh mì, xà lách và cà chua", "Bread, lettuce, and tomato sit on three plates."),
      frame("make-sandwich", 2, "Khủng Long xếp xà lách và cà chua lên lát bánh, chưa đậy nắp", "Dino puts the lettuce and tomato on the bread."),
      frame("make-sandwich", 3, "Chiếc bánh mì kẹp đã đậy lát bánh trên, nhân lộ ra ở cạnh", "The top slice goes on, and the sandwich is ready."),
    ],
  },
  {
    id: "give-present",
    title: "A Present for a Friend",
    titleVi: "Tặng quà cho bạn",
    narration:
      "Bunny wraps a present in green paper. Bunny gives the box to Princess. The box opens, and inside there is a teddy bear.",
    frames: [
      frame("give-present", 1, "Thỏ ngồi bên hộp quà xanh vừa gói xong, cuộn giấy còn bên cạnh", "Bunny wraps a present in green paper."),
      frame("give-present", 2, "Thỏ trao hộp quà cho Công Chúa, hai bạn cùng cầm", "Bunny gives the box to Princess."),
      frame("give-present", 3, "Hộp quà đã mở, một chú gấu bông nâu nhô lên", "The box opens, and inside there is a teddy bear."),
    ],
  },
  {
    id: "fix-kite",
    title: "Fix the Kite",
    titleVi: "Sửa chiếc diều",
    narration:
      "Robot's red kite has a big tear. Robot mends the tear with a piece of cloth. The kite flies high in the blue sky again.",
    frames: [
      frame("fix-kite", 1, "Rô-bốt cầm con diều đỏ bị rách một mảng", "Robot's red kite has a big tear."),
      frame("fix-kite", 2, "Con diều đã được vá, có một miếng vá vuông màu kem", "Robot mends the tear with a piece of cloth."),
      frame("fix-kite", 3, "Diều bay cao trên trời, Rô-bốt cầm cuộn dây nhìn theo", "The kite flies high in the blue sky again."),
    ],
  },
  {
    id: "feed-birds",
    title: "Feed the Birds",
    titleVi: "Cho chim ăn",
    narration:
      "The little birds wait on the fence. Princess sprinkles seeds on the ground. The birds fly down and peck the seeds together.",
    frames: [
      frame("feed-birds", 1, "Ba chú chim đậu trên hàng rào, Công Chúa cầm túi hạt còn đóng", "The little birds wait on the fence."),
      frame("feed-birds", 2, "Công Chúa chìa tay rắc hạt, hạt rơi thành dòng xuống đất", "Princess sprinkles seeds on the ground."),
      frame("feed-birds", 3, "Ba chú chim đã xuống đất, cúi đầu mổ hạt", "The birds fly down and peck the seeds together."),
    ],
  },
  {
    id: "pack-school-bag",
    title: "Pack the School Bag",
    titleVi: "Chuẩn bị cặp đi học",
    narration:
      "The books and the pencil case are next to the empty bag. Dino puts the books into the bag. Dino closes the bag. The bag is on Dino's back, ready for school.",
    frames: [
      frame("pack-school-bag", 1, "Sách và hộp bút nằm trên thảm cạnh chiếc cặp xanh mở rỗng", "The books and the pencil case are next to the empty bag."),
      frame("pack-school-bag", 2, "Khủng Long cúi xuống bỏ quyển sách vào trong cặp đang mở", "Dino puts the books into the bag."),
      frame("pack-school-bag", 3, "Chiếc cặp đã đóng kín, Khủng Long đứng thẳng nắm quai cặp", "Dino closes the bag."),
      frame("pack-school-bag", 4, "Khủng Long đeo cặp trên lưng, sàn nhà đã sạch đồ", "The bag is on Dino's back, ready for school."),
    ],
  },
  {
    id: "plant-young-tree",
    title: "Plant a Little Tree",
    titleVi: "Trồng cây non",
    narration:
      "Robot digs a small hole. Robot puts the little tree into the hole. Robot fills the soil around the tree. At last, Robot waters the tree.",
    frames: [
      frame("plant-young-tree", 1, "Rô-bốt cầm xẻng, trước mặt là chiếc hố tròn đã đào xong", "Robot digs a small hole."),
      frame("plant-young-tree", 2, "Rô-bốt bưng cây non có bầu rễ, hạ xuống hố", "Robot puts the little tree into the hole."),
      frame("plant-young-tree", 3, "Cây non đứng thẳng, Rô-bốt dùng xẻng vun đất quanh gốc", "Robot fills the soil around the tree."),
      frame("plant-young-tree", 4, "Rô-bốt cầm bình xanh tưới nước cho cây non", "At last, Robot waters the tree."),
    ],
  },
  {
    id: "make-clay-bowl",
    title: "Make a Clay Bowl",
    titleVi: "Làm chiếc bát đất nặn",
    narration:
      "Octo has a round ball of clay. Octo rolls the clay into a long snake. The snake curls up into a deep bowl. At last, Octo adds yellow dots around the bowl.",
    frames: [
      frame("make-clay-bowl", 1, "Bạch Tuộc ôm một cục đất nặn tròn trơn", "Octo has a round ball of clay."),
      frame("make-clay-bowl", 2, "Cục đất đã lăn thành cuộn dây dài, cuốn lại thành vòng", "Octo rolls the clay into a long snake."),
      frame("make-clay-bowl", 3, "Chiếc bát đã thành hình, miệng tròn và lòng bát sâu", "The snake curls up into a deep bowl."),
      frame("make-clay-bowl", 4, "Chiếc bát có một hàng chấm tròn màu vàng quanh thân", "At last, Octo adds yellow dots around the bowl."),
    ],
  },
  {
    id: "make-paper-boat",
    title: "Make a Paper Boat",
    titleVi: "Làm thuyền giấy",
    narration:
      "Princess holds a flat blue paper. Princess folds the paper into a triangle. The paper boat is ready on the table. Princess puts the boat on the stream.",
    frames: [
      frame("make-paper-boat", 1, "Công Chúa cầm tờ giấy xanh vuông còn phẳng", "Princess holds a flat blue paper."),
      frame("make-paper-boat", 2, "Tờ giấy đã gấp đôi thành hình tam giác", "Princess folds the paper into a triangle."),
      frame("make-paper-boat", 3, "Chiếc thuyền giấy xanh gấp xong, đặt trên mặt bàn", "The paper boat is ready on the table."),
      frame("make-paper-boat", 4, "Công Chúa thả thuyền giấy xuống dòng suối, thuyền nổi trên nước", "Princess puts the boat on the stream."),
    ],
  },
  {
    id: "wash-clothes",
    title: "Wash the Clothes",
    titleVi: "Giặt quần áo",
    narration:
      "The dirty clothes are in the basket. Robot puts the clothes into the washing machine. The clean clothes dry on the line in the sun. When they are dry, Robot folds them neatly.",
    frames: [
      frame("wash-clothes", 1, "Áo đỏ, quần xanh và tất vàng lấm bẩn nằm trong giỏ", "The dirty clothes are in the basket."),
      frame("wash-clothes", 2, "Rô-bốt cho quần áo bẩn vào máy giặt đang mở cửa", "Robot puts the clothes into the washing machine."),
      frame("wash-clothes", 3, "Quần áo sạch phơi trên dây ngoài nắng, giỏ đã trống", "The clean clothes dry on the line in the sun."),
      frame("wash-clothes", 4, "Rô-bốt gấp quần áo khô thành chồng gọn trên bàn", "When they are dry, Robot folds them neatly."),
    ],
  },
  {
    id: "go-picnic",
    title: "Go on a Picnic",
    titleVi: "Đi dã ngoại",
    narration:
      "Bunny and Dino get a basket and a blanket ready. They put bread and apples into the basket. They carry the basket along the path to the park. The blanket is out, and they eat together.",
    frames: [
      frame("go-picnic", 1, "Thỏ và Khủng Long bên chiếc giỏ trống và tấm thảm đỏ gấp", "Bunny and Dino get a basket and a blanket ready."),
      frame("go-picnic", 2, "Hai bạn xếp bánh mì kẹp và táo đỏ vào giỏ", "They put bread and apples into the basket."),
      frame("go-picnic", 3, "Hai bạn xách giỏ đi trên con đường mòn giữa cây xanh", "They carry the basket along the path to the park."),
      frame("go-picnic", 4, "Thảm đã trải dưới gốc cây, hai bạn ngồi ăn bánh và táo", "The blanket is out, and they eat together."),
    ],
  },
  {
    id: "build-snowman",
    title: "Build a Snowman",
    titleVi: "Làm người tuyết",
    narration:
      "Dino rolls a very big snowball. Dino puts a small ball on top. Dino adds two sticks for the arms. The snowman has a warm hat and a red scarf.",
    frames: [
      frame("build-snowman", 1, "Khủng Long lăn một quả cầu tuyết thật to trên sân", "Dino rolls a very big snowball."),
      frame("build-snowman", 2, "Quả cầu nhỏ đã đặt chồng lên quả to thành hai tầng", "Dino puts a small ball on top."),
      frame("build-snowman", 3, "Người tuyết đã có hai cành cây làm tay hai bên", "Dino adds two sticks for the arms."),
      frame("build-snowman", 4, "Người tuyết đội mũ len xanh, quàng khăn đỏ, có mũi cà rốt", "The snowman has a warm hat and a red scarf."),
    ],
  },
  {
    id: "butterfly-grows",
    title: "The Butterfly Grows",
    titleVi: "Bướm lớn lên",
    narration:
      "A tiny egg sits on a green leaf. A caterpillar comes out and eats the leaf. The caterpillar becomes a chrysalis on a branch. A beautiful butterfly flies away.",
    frames: [
      frame("butterfly-grows", 1, "Một quả trứng trắng nhỏ nằm trên chiếc lá xanh", "A tiny egg sits on a green leaf."),
      frame("butterfly-grows", 2, "Sâu bướm xanh bò trên lá, mép lá đã bị ăn khuyết", "A caterpillar comes out and eats the leaf."),
      frame("butterfly-grows", 3, "Chiếc nhộng xanh treo lủng lẳng dưới cành cây", "The caterpillar becomes a chrysalis on a branch."),
      frame("butterfly-grows", 4, "Chú bướm cam xanh bay lên, vỏ nhộng rỗng còn treo lại", "A beautiful butterfly flies away."),
    ],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    title: "My Day",
    titleVi: "Việc của bé",
    storyIds: ["wash-hands", "tidy-toys", "build-tower"],
  },
  {
    id: "ch2",
    title: "I Can Make Things",
    titleVi: "Bé sáng tạo",
    storyIds: ["paint-picture", "plant-seed", "rainy-day"],
  },
  {
    id: "ch3",
    title: "Step by Step",
    titleVi: "Bé làm từng bước",
    storyIds: ["brush-teeth", "wear-coat", "make-sandwich"],
  },
  {
    id: "ch4",
    title: "Me and My Friends",
    titleVi: "Bé và bạn bè",
    storyIds: ["give-present", "fix-kite", "feed-birds"],
  },
  {
    id: "ch5",
    title: "Four First Steps",
    titleVi: "Bốn bước đầu tiên",
    storyIds: ["pack-school-bag", "plant-young-tree", "make-clay-bowl", "make-paper-boat"],
  },
  {
    id: "ch6",
    title: "A Longer Journey",
    titleVi: "Hành trình dài hơn",
    storyIds: ["wash-clothes", "go-picnic", "build-snowman", "butterfly-grows"],
  },
];

// Thứ tự tuyến tính toàn bộ (để mở khoá dần + tìm 'truyện tiếp theo').
export const STORY_ORDER: string[] = ["wash-hands", "tidy-toys", "build-tower", "paint-picture", "plant-seed", "rainy-day", "brush-teeth", "wear-coat", "make-sandwich", "give-present", "fix-kite", "feed-birds", "pack-school-bag", "plant-young-tree", "make-clay-bowl", "make-paper-boat", "wash-clothes", "go-picnic", "build-snowman", "butterfly-grows"];

export const storyById = (id: string): Story | undefined =>
  STORIES.find((s) => s.id === id);

export const chapterOfStory = (id: string): Chapter | undefined =>
  CHAPTERS.find((c) => c.storyIds.includes(id));

export const INSTRUCTION = "Nghe tiếng Anh rồi xếp các tranh theo đúng thứ tự trước–sau nhé!";
export const LISTEN_LABEL = "Listen to the story";
export const PRAISES = [
  "Great job!", "That's right!", "Well done!", "Awesome!", "You're doing great!",
];
