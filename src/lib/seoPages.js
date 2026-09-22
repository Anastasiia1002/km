import { listedArticles, industries, regions, site } from "../data.js";
import { homeKeywords } from "./seoConfig.js";

function absoluteUrl(path = "/") {
  if (!path || path === "/") return `${site.baseUrl}/`;
  return `${site.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

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

function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleKeywords(article) {
  if (Array.isArray(article.keywords) && article.keywords.length) return article.keywords;
  return [article.category, "GPS моніторинг", "Wialon"].filter(Boolean);
}

export function articleImageUrl(article) {
  return article.image ? `${site.baseUrl}${article.image.split("?")[0]}` : site.ogImage;
}

export function articleSeo(article) {
  const path = `/statti/${article.slug}/`;
  const image = articleImageUrl(article);
  const published = article.dateIso || undefined;
  return {
    path,
    title: `${article.title} — КМ Трейд`,
    description: article.description,
    type: "article",
    image,
    keywords: articleKeywords(article),
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: "Статті", path: "/statti/" },
        { name: article.title, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        image,
        ...(published ? { datePublished: published, dateModified: published } : {}),
        articleSection: article.category,
        inLanguage: "uk-UA",
        author: { "@type": "Organization", name: site.name },
        publisher: {
          "@type": "Organization",
          name: site.name,
          logo: { "@type": "ImageObject", url: site.ogImage },
        },
        mainEntityOfPage: absoluteUrl(path),
      },
    ],
  };
}

export function regionSeo(region) {
  const path = `/${region.slug}/`;
  return {
    path,
    title: `${region.title} — КМ Трейд Wialon`,
    description: region.description,
    type: "website",
    keywords: region.keys,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: region.city, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: region.title,
        description: region.description,
        provider: { "@type": "LocalBusiness", name: site.name, url: site.baseUrl },
        areaServed: region.oblast,
        url: absoluteUrl(path),
      },
      region.faq?.length ? faqJsonLd(region.faq) : null,
    ].filter(Boolean),
  };
}

export function industrySeo(industry) {
  const path = `/${industry.slug}/`;
  return {
    path,
    title: `${industry.title} — КМ Трейд`,
    description: industry.description,
    type: "website",
    keywords: [industry.title, industry.name, "GPS моніторинг", "Wialon"],
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: industry.name, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: industry.title,
        description: industry.description,
        provider: { "@type": "Organization", name: site.name, url: site.baseUrl },
        url: absoluteUrl(path),
      },
    ],
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

const blogKeywords = ["GPS моніторинг", "Wialon", "контроль пального", "статті", "бензовози", "сільгосптехніка"];
const blogDescription =
  "Практичні статті про GPS-моніторинг: бензовози, каршеринг, агро, спецтехніка, міжнародні рейси, Wialon і контроль пального.";

export function blogSeo() {
  return {
    path: "/statti/",
    title: "Статті про GPS-моніторинг транспорту — КМ Трейд",
    description: blogDescription,
    keywords: blogKeywords,
    type: "website",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: "Статті", path: "/statti/" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Статті про GPS-моніторинг транспорту",
        description: blogDescription,
        url: absoluteUrl("/statti/"),
        inLanguage: "uk-UA",
      },
    ],
  };
}

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
    blogSeo(),
    {
      path: "/oferta/",
      title: "Оферта — КМ Трейд",
      description: "Договір публічної оферти на платне надання послуг GPS моніторингу КМ Трейд.",
      type: "website",
      jsonLd: breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: "Оферта", path: "/oferta/" },
      ]),
    },
    {
      path: "/konfidentsiynist/",
      title: "Політика конфіденційності — КМ Трейд",
      description: "Політика конфіденційності КМ Трейд: збір, обробка та захист персональних даних користувачів сайту.",
      type: "website",
      jsonLd: breadcrumbJsonLd([
        { name: "Головна", path: "/" },
        { name: "Політика конфіденційності", path: "/konfidentsiynist/" },
      ]),
    },
  ];

  for (const region of regions) {
    pages.push(regionSeo(region));
  }

  for (const industry of industries) {
    pages.push(industrySeo(industry));
  }

  for (const article of listedArticles) {
    pages.push(articleSeo(article));
  }

  return pages;
}

export { faqJsonLd, homeFaq, breadcrumbJsonLd, absoluteUrl, blogKeywords, blogDescription };
