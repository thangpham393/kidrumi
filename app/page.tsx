import Link from "next/link";
import Image from "next/image";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

const cards = [
  {
    href: "/tasks",
    cls: "c-task",
    img: "/illustrations/tasks.png",
    title: "Nhiệm vụ",
    tag: "Việc tốt mỗi ngày",
    desc: "Danh sách việc hằng ngày của bé. Làm xong mỗi việc được một ngôi sao, đủ sao thì mở quà.",
  },
  {
    href: "/shadowing",
    cls: "c-shad",
    img: "/illustrations/shadowing.png",
    title: "Shadowing",
    tag: "Luyện nói tiếng Anh",
    desc: "Bé xem video tiếng Anh rồi nghe và nói lại theo từng câu để luyện phát âm.",
  },
  {
    href: "/math",
    cls: "c-math",
    img: "/illustrations/math.png",
    title: "Học toán",
    tag: "Phiếu bài tập cộng trừ nhân chia",
    desc: "Ba mẹ chọn phép tính và độ khó, bé điền kết quả rồi được chấm điểm ngay.",
  },
  {
    href: "/typing",
    cls: "c-type",
    img: "/illustrations/typing.png",
    title: "Tập gõ phím",
    tag: "Luyện gõ 10 ngón",
    desc: "Bé tập gõ bàn phím bằng mười ngón, có cả tiếng Việt (Telex) và tiếng Anh.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: "vi-VN",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      logo: `${siteUrl}/icon.svg`,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: "Trẻ tuổi tiền tiểu học",
      },
    },
    {
      "@type": "ItemList",
      name: "Các góc học của Kidrumi",
      itemListElement: cards.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.title} — ${c.tag}`,
        description: c.desc,
        url: `${siteUrl}${c.href}`,
      })),
    },
  ],
};

export default function Home() {
  return (
    <main className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="page-eyebrow">KIDRUMI</p>
      <h1 className="page-title">Hôm nay con muốn học gì?</h1>
      <p className="page-sub">
        Chọn một góc học nhé — mỗi ngày một chút, vui là chính!
      </p>

      <section className="grid-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={`act-card ${c.cls}`}>
            <span className="tape" />
            <div className="act-thumb">
              <Image
                src={c.img}
                alt={c.title}
                fill
                sizes="(max-width: 720px) 45vw, (max-width: 900px) 150px, 190px"
                className="thumb-img"
              />
            </div>
            <div className="act-body">
              <h3>{c.title}</h3>
              <div className="tag">{c.tag}</div>
              <p>{c.desc}</p>
              <span className="act-cta">Vào chơi →</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
