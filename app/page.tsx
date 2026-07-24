import Link from "next/link";
import Image from "next/image";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

type Card = {
  href: string;
  cls: string;
  img?: string;
  glyph?: string;
  title: string;
  tag: string;
  desc: string;
};

const cards: Card[] = [
  {
    href: "/tasks",
    cls: "c-task",
    img: "/illustrations/tasks.png",
    title: "Nhiệm vụ",
    tag: "Việc tốt mỗi ngày",
    desc: "Danh sách việc hằng ngày của bé. Làm xong mỗi việc được một ngôi sao, đủ sao thì mở quà.",
  },
  {
    href: "/english",
    cls: "c-en",
    img: "/illustrations/shadowing.png",
    title: "Tiếng Anh",
    tag: "Nghe, nói và chơi",
    desc: "Góc Tiếng Anh của bé: luyện nói theo video với Shadowing và chơi Nghe & chọn nghe từ chạm hình.",
  },
  {
    href: "/chinese",
    cls: "c-zh",
    img: "/illustrations/chinese.png",
    title: "Tiếng Trung",
    tag: "Nghe, nói và chơi",
    desc: "Góc Tiếng Trung của bé: xem video luyện nói theo câu và chơi Nghe & chọn với chữ Hán vui nhộn.",
  },
  {
    href: "/vietnamese",
    cls: "c-vi",
    img: "/illustrations/vietnamese.png",
    title: "Tiếng Việt",
    tag: "Nghe và chơi",
    desc: "Góc Tiếng Việt của bé: nghe câu chuyện ngắn rồi xếp tranh theo đúng thứ tự trước sau.",
  },
  {
    href: "/math",
    cls: "c-math",
    img: "/illustrations/math.png",
    title: "Học Toán",
    tag: "Vườn Toán — chơi mà học",
    desc: "Vườn Toán của bé: phân loại, so sánh, đếm, nhận biết hình và phiếu bài tập cộng trừ nhân chia.",
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
            <div className={`act-thumb ${c.img ? "" : "emoji"}`}>
              {c.img ? (
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="(max-width: 720px) 45vw, (max-width: 900px) 150px, 190px"
                  className="thumb-img"
                />
              ) : (
                <span className="thumb-glyph" aria-hidden>
                  {c.glyph}
                </span>
              )}
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
