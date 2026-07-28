import Link from "next/link";
import Image from "next/image";
import HomeMascot from "@/components/HomeMascot";
import HomeCheckin from "@/components/HomeCheckin";
import ChildName from "@/components/ChildName";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

type Card = {
  href: string;
  tone: string; // lớp màu chủ đề thẻ (--c)
  img: string;
  title: string;
  tag: string;
};

// 3 thẻ dọc (trên) + 3 thẻ ngang (dưới) — grid góc học bên dưới hero
const portraits: Card[] = [
  { href: "/tasks", tone: "t-purple", img: "/illustrations/tasks.png", title: "Nhiệm vụ", tag: "Việc tốt mỗi ngày" },
  { href: "/english", tone: "t-violet", img: "/illustrations/shadowing.png", title: "Tiếng Anh", tag: "Nghe, nói và chơi" },
  { href: "/chinese", tone: "t-red", img: "/illustrations/chinese.png", title: "Tiếng Trung", tag: "Nghe, nói và chơi" },
];
const lands: Card[] = [
  { href: "/vietnamese", tone: "t-pink", img: "/illustrations/vietnamese.png", title: "Tiếng Việt", tag: "Nghe và đọc" },
  { href: "/math", tone: "t-green", img: "/illustrations/math.png", title: "Học Toán", tag: "Vừa toán – Giỏi tư duy" },
  { href: "/typing", tone: "t-blue", img: "/illustrations/typing.png", title: "Tập gõ phím", tag: "Luyện gõ 10 ngón" },
];
const allCards = [...portraits, ...lands];

const stats = [
  { ic: "👤", num: "10.000+", label: "Bé đang học" },
  { ic: "⭐", num: "500+", label: "Bài học thú vị" },
  { ic: "❤️", num: "98%", label: "Phụ huynh hài lòng" },
  { ic: "🛡️", num: "100%", label: "An toàn cho trẻ em" },
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
      name: "Các góc học của KATKID",
      itemListElement: allCards.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.title} — ${c.tag}`,
        url: `${siteUrl}${c.href}`,
      })),
    },
  ],
};

export default function Home() {
  return (
    <main className="wrap home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------------- Hero banner (giữ nguyên) ---------------- */}
      <section className="hero-banner">
        <div className="hero-scene" aria-hidden>
          <Image
            src="/illustrations/background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-scene-img"
          />
        </div>
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="star s1" aria-hidden>⭐</span>
              Hôm nay{" "}
              <span className="star s2" aria-hidden>⭐</span>
              <span className="grad">con muốn học gì?</span>
            </h1>
            <p className="hero-sub">
              Chơi và học mỗi ngày giúp con phát triển ngôn ngữ, tư duy và sự tự
              tin!
            </p>
            <Link href="/tasks" className="btn hero-cta">
              Bắt đầu ngay 🚀
            </Link>
          </div>

          <div className="hero-art">
            <div className="hero-bubble">
              <strong>Chào mừng <ChildName />!</strong>
              <span>Học vui mỗi ngày, tiến bộ mỗi ngày!</span>
            </div>
            <div className="hero-mascot">
              <HomeMascot
                src="/illustrations/home-hero.png"
                alt="Bạn khủng long KATKID chào bé"
                emoji="🦖"
                sizes="(max-width: 820px) 60vw, 420px"
                className="hero-mascot-img"
              />
            </div>
            <HomeCheckin />
          </div>
        </div>
      </section>

      {/* ---------------- Grid góc học: mascot cạnh lưới (3 dọc + 3 ngang) ---------------- */}
      <section className="cardgrid" aria-label="Các góc học của bé">
        <div className="cardgrid-scene" aria-hidden>
          <Image
            src="/illustrations/background.png"
            alt=""
            fill
            sizes="100vw"
            className="cardgrid-scene-img"
          />
        </div>
        <div className="cardgrid-inner">
          <div className="cardgrid-portraits">
            <div className="cardgrid-mascot" aria-hidden>
              <HomeMascot
                src="/illustrations/home-cards.png"
                alt=""
                emoji="🦖"
                sizes="(max-width: 900px) 70vw, 280px"
                className="cardgrid-mascot-img"
              />
            </div>
            {portraits.map((c) => (
              <Link key={c.href} href={c.href} className={`pc ${c.tone}`}>
                <div className="pc-head">
                  <h3>{c.title}</h3>
                  <p>{c.tag}</p>
                </div>
                <div className="pc-thumb">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 720px) 90vw, 24vw"
                    className="pc-img"
                    unoptimized
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="cardgrid-lands">
            {lands.map((c) => (
              <Link key={c.href} href={c.href} className={`lc ${c.tone}`}>
                <div className="lc-text">
                  <h3>{c.title}</h3>
                  <p>{c.tag}</p>
                </div>
                <div className="lc-thumb">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 720px) 42vw, 190px"
                    className="lc-img"
                    unoptimized
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Banner CTA + số liệu ---------------- */}
      <section className="home-promo">
        <div className="promo-mascot" aria-hidden>
          <HomeMascot
            src="/illustrations/home-cta.png"
            alt=""
            emoji="🦕"
            sizes="(max-width: 720px) 130px, 220px"
            className="promo-mascot-img"
          />
        </div>
        <div className="promo-main">
          <div className="promo-head">
            <div className="promo-text">
              <h2>Cùng KATKID học vui mỗi ngày!</h2>
              <p>
                Học qua trò chơi, video và hoạt động tương tác giúp bé tiến bộ
                từng ngày một cách tự nhiên nhất.
              </p>
            </div>
            <Link href="/tasks" className="promo-btn">
              👑 Bắt đầu ngay
            </Link>
          </div>
          <div className="promo-stats">
            {stats.map((s) => (
              <div key={s.label} className="promo-stat">
                <span className="promo-stat-ic" aria-hidden>
                  {s.ic}
                </span>
                <div>
                  <strong>{s.num}</strong>
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
