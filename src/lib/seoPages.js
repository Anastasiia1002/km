import { articles, industries, regions, site } from "../data.js";
import { homeKeywords } from "./seoConfig.js";

function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

const homeFaq = [
  {
    q: "Скільки коштує GPS-моніторинг?",
    a: "Абонплата від 250 грн за авто на місяць, включно з мобільним зв'язком. Для комунального транспорту — від 150 грн. Є тест 14 днів.",
  },
  {
    q: "У яких областях виїжджаєте на монтаж?",
    a: "Чернівецька, Івано-Франківська, Тернопільська, Хмельницька, Львівська, Рівненська та Київська області. Офіс у Чернівцях.",
  },
  {
    q: "Чи потрібен Wialon для старту?",
    a: "Так, КМ Трейд — авторизований партнер Wialon / Gurtam. Підключаємо Wialon Local або Hosting, налаштовуємо звіти і навчаємо диспетчера.",
  },
];

export function listSeoPages() {
  const pages = [
    {
      path: "/",
      title: "КМ Трейд — GPS-моніторинг автопарку в Україні | Wialon",
      description:
        "Авторизований партнер Wialon / Gurtam. GPS-моніторинг транспорту у 7 областях України. Офіс у місті Чернівці. Від 250 грн з моб.зв'язком, тест 14 днів, виїзд на монтаж.",
      keywords: homeKeywords,
      type: "website",
      jsonLd: faqJsonLd(homeFaq),
    },
    {
      path: "/statti/",
      title: "Статті про GPS-моніторинг транспорту — КМ Трейд",
      description: "Практичні статті про Wialon, контроль пального, GPS для агро, вантажівок і автопарків в Україні.",
      keywords: ["GPS моніторинг", "Wialon", "контроль пального", "статті"],
      type: "website",
    },
    {
      path: "/oferta/",
      title: "Оферта — КМ Трейд",
      description: "Договір публічної оферти на платне надання послуг GPS моніторингу КМ Трейд.",
      type: "website",
    },
    {
      path: "/konfidentsiynist/",
      title: "Політика конфіденційності — КМ Трейд",
      description: "Політика конфіденційності КМ Трейд: збір, обробка та захист персональних даних користувачів сайту.",
      type: "website",
    },
  ];

  for (const region of regions) {
    pages.push({
      path: `/${region.slug}/`,
      title: `${region.title} — КМ Трейд Wialon`,
      description: region.description,
      keywords: region.keys,
      type: "website",
      jsonLd: region.faq?.length ? faqJsonLd(region.faq) : null,
    });
  }

  for (const industry of industries) {
    pages.push({
      path: `/${industry.slug}/`,
      title: `${industry.title} — КМ Трейд`,
      description: industry.description,
      keywords: [industry.title, industry.name, "GPS моніторинг", "Wialon"],
      type: "website",
    });
  }

  for (const article of articles) {
    pages.push({
      path: `/statti/${article.slug}/`,
      title: `${article.title} — КМ Трейд`,
      description: article.description,
      keywords: [article.category, "GPS моніторинг", "Wialon"].filter(Boolean),
      type: "article",
      image: article.image ? `${site.baseUrl}${article.image.split("?")[0]}` : site.ogImage,
    });
  }

  return pages;
}

export { faqJsonLd, homeFaq };
