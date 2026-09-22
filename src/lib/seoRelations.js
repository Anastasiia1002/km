import { articles, industries, isListedArticle } from "../data.js";

export const articleIndustryBySlug = {
  "gps-monitorynh-dlya-sluzhb-dostavky": "gps-dlya-dostavky",
  "gps-monitorynh-mizhnarodnykh-pasazhyrskykh-perevezen": "gps-dlya-mizhnarodnykh-reysiv",
  "gps-rishennya-dlya-mizhnarodnykh-perevezen": "gps-dlya-mizhnarodnykh-reysiv",
  "gps-monitorynh-benzovoziv": "gps-dlya-azs",
  "gps-monitorynh-dlya-karsherynhu": "gps-dlya-korporatyvnoho-parku",
  "gps-monitorynh-lehkovykh-avto": "gps-dlya-korporatyvnoho-parku",
  "gps-monitorynh-pasazhyrskykh-perevezen": "gps-dlya-taksi",
  "gps-monitorynh-silhosptekhniky": "gps-dlya-agro",
  "gps-monitorynh-spectekhniky": "gps-dlya-budtekhniky",
  "shcho-take-wialon": "gps-dlya-korporatyvnoho-parku",
  "okupnist-gps-monitoringu": "gps-dlya-korporatyvnoho-parku",
  "gps-dlya-traktora-zakhid-ukraina": "gps-dlya-agro",
  "yak-pereviryty-vodiya-gps": "gps-dlya-korporatyvnoho-parku",
  "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent": "gps-dlya-mizhnarodnykh-reysiv",
  "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho": "gps-dlya-azs",
  "optymizatsiia-karsherynhu": "gps-dlya-korporatyvnoho-parku",
  "monitorynh-vytrat-na-palyvo-dlia-pidpryiemstva": "gps-dlya-azs",
  "zchytuvannia-danykh-z-takhohrafa": "gps-dlya-mizhnarodnykh-reysiv",
  "hotuiemos-do-ahrosezonu": "gps-dlya-agro",
  "pryvit-svit": "gps-dlya-agro",
};

export const relatedArticleSlugs = {
  "gps-monitorynh-dlya-sluzhb-dostavky": [
    "gps-monitorynh-lehkovykh-avto",
    "yak-pereviryty-vodiya-gps",
    "okupnist-gps-monitoringu",
  ],
  "gps-monitorynh-mizhnarodnykh-pasazhyrskykh-perevezen": [
    "gps-monitorynh-pasazhyrskykh-perevezen",
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "zchytuvannia-danykh-z-takhohrafa",
  ],
  "gps-rishennya-dlya-mizhnarodnykh-perevezen": [
    "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent",
    "zchytuvannia-danykh-z-takhohrafa",
    "gps-monitorynh-benzovoziv",
  ],
  "gps-monitorynh-benzovoziv": [
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "monitorynh-vytrat-na-palyvo-dlia-pidpryiemstva",
  ],
  "gps-monitorynh-dlya-karsherynhu": [
    "optymizatsiia-karsherynhu",
    "gps-monitorynh-lehkovykh-avto",
    "yak-pereviryty-vodiya-gps",
  ],
  "gps-monitorynh-lehkovykh-avto": [
    "yak-pereviryty-vodiya-gps",
    "gps-monitorynh-dlya-karsherynhu",
    "okupnist-gps-monitoringu",
  ],
  "gps-monitorynh-pasazhyrskykh-perevezen": [
    "shcho-take-wialon",
    "yak-pereviryty-vodiya-gps",
    "okupnist-gps-monitoringu",
  ],
  "gps-monitorynh-silhosptekhniky": [
    "gps-dlya-traktora-zakhid-ukraina",
    "hotuiemos-do-ahrosezonu",
    "gps-monitorynh-spectekhniky",
  ],
  "gps-monitorynh-spectekhniky": [
    "gps-monitorynh-silhosptekhniky",
    "okupnist-gps-monitoringu",
    "gps-monitoring-u-zakhidniy-ukraini",
  ],
  "shcho-take-wialon": [
    "okupnist-gps-monitoringu",
    "novyj-rejtynh-vid-gurtam",
    "yak-pereviryty-vodiya-gps",
  ],
  "okupnist-gps-monitoringu": [
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
    "gps-monitorynh-lehkovykh-avto",
    "shcho-take-wialon",
  ],
  "gps-dlya-traktora-zakhid-ukraina": [
    "gps-monitorynh-silhosptekhniky",
    "hotuiemos-do-ahrosezonu",
    "pryvit-svit",
  ],
  "yak-pereviryty-vodiya-gps": [
    "gps-monitorynh-lehkovykh-avto",
    "okupnist-gps-monitoringu",
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
  ],
  "gps-monitoring-u-zakhidniy-ukraini": [
    "gps-dlya-traktora-zakhid-ukraina",
    "okupnist-gps-monitoringu",
    "shcho-take-wialon",
  ],
  "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent": [
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "zchytuvannia-danykh-z-takhohrafa",
    "gps-monitorynh-benzovoziv",
  ],
  "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho": [
    "monitorynh-vytrat-na-palyvo-dlia-pidpryiemstva",
    "gps-monitorynh-benzovoziv",
    "okupnist-gps-monitoringu",
  ],
  "optymizatsiia-karsherynhu": [
    "gps-monitorynh-dlya-karsherynhu",
    "gps-monitorynh-lehkovykh-avto",
    "yak-pereviryty-vodiya-gps",
  ],
  "monitorynh-vytrat-na-palyvo-dlia-pidpryiemstva": [
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
    "gps-monitorynh-benzovoziv",
    "okupnist-gps-monitoringu",
  ],
  "zchytuvannia-danykh-z-takhohrafa": [
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent",
    "shcho-take-wialon",
  ],
  "hotuiemos-do-ahrosezonu": [
    "gps-monitorynh-silhosptekhniky",
    "gps-dlya-traktora-zakhid-ukraina",
    "pryvit-svit",
  ],
  "pryvit-svit": [
    "gps-monitorynh-silhosptekhniky",
    "gps-dlya-traktora-zakhid-ukraina",
    "hotuiemos-do-ahrosezonu",
  ],
  "novyj-rejtynh-vid-gurtam": [
    "shcho-take-wialon",
    "okupnist-gps-monitoringu",
    "gps-monitoring-u-zakhidniy-ukraini",
  ],
};

export const industryArticleSlugs = {
  "gps-dlya-mizhnarodnykh-reysiv": [
    "gps-monitorynh-mizhnarodnykh-pasazhyrskykh-perevezen",
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent",
  ],
  "gps-dlya-azs": [
    "gps-monitorynh-benzovoziv",
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
    "monitorynh-vytrat-na-palyvo-dlia-pidpryiemstva",
  ],
  "gps-dlya-korporatyvnoho-parku": [
    "gps-monitorynh-lehkovykh-avto",
    "gps-monitorynh-dlya-karsherynhu",
    "optymizatsiia-karsherynhu",
  ],
  "gps-dlya-agro": [
    "gps-monitorynh-silhosptekhniky",
    "gps-dlya-traktora-zakhid-ukraina",
    "hotuiemos-do-ahrosezonu",
  ],
  "gps-dlya-budtekhniky": ["gps-monitorynh-spectekhniky", "okupnist-gps-monitoringu"],
  "gps-dlya-vantazhivok": [
    "gps-rishennya-dlya-mizhnarodnykh-perevezen",
    "zchytuvannia-danykh-z-takhohrafa",
    "iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho",
  ],
  "gps-dlya-taksi": [
    "gps-monitorynh-pasazhyrskykh-perevezen",
    "gps-monitorynh-mizhnarodnykh-pasazhyrskykh-perevezen",
    "yak-pereviryty-vodiya-gps",
  ],
  "gps-dlya-dostavky": [
    "gps-monitorynh-dlya-sluzhb-dostavky",
    "gps-monitorynh-lehkovykh-avto",
    "yak-pereviryty-vodiya-gps",
  ],
};

export function relatedArticlesFor(article) {
  const preferred = (relatedArticleSlugs[article.slug] || [])
    .map((slug) => articles.find((item) => item.slug === slug))
    .filter((item) => item && isListedArticle(item));
  const rest = articles.filter(
    (item) =>
      isListedArticle(item) &&
      item.slug !== article.slug &&
      !preferred.some((related) => related.slug === item.slug),
  );
  const sameCategory = rest.filter((item) => item.category === article.category);
  const other = rest.filter((item) => item.category !== article.category);
  return [...preferred, ...sameCategory, ...other].slice(0, 3);
}

export function industryForArticle(article) {
  const slug = articleIndustryBySlug[article.slug];
  return slug ? industries.find((item) => item.slug === slug) || null : null;
}

export function articlesForIndustry(industry) {
  return (industryArticleSlugs[industry.slug] || [])
    .map((slug) => articles.find((item) => item.slug === slug))
    .filter((item) => item && isListedArticle(item));
}
