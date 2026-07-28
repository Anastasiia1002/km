# КМ Трейд — GPS-моніторинг транспорту

Сайт авторизованого партнера **Wialon / Gurtam** для GPS-моніторингу автопарків.
Стек: **React 19 + Vite 8**, деплой на **GitHub Pages** з гілки `main`.

## Публічні адреси

| Середовище | URL |
| --- | --- |
| GitHub Pages | https://anastasiia1002.github.io/km/ |
| Production (canonical) | https://km-trade.net/ |

Canonical, `sitemap.xml` і `robots.txt` налаштовані на **km-trade.net**.

## Що є на сайті

- **Головна:** hero, trust bar, болі клієнта, калькулятор економії пального, УТП, кейси, партнери, галузі, регіони, як працюємо, тарифи, тест 14 днів, про компанію, сертифікати (карусель), блог-прев’ю, контакти.
- **7 регіональних SEO-сторінок:** Чернівці, Івано-Франківськ, Тернопіль, Хмельницький, Львів, Рівне, Київ.
- **8 галузевих SEO-сторінок:** вантажівки, агро, будтехніка, таксі, доставка, корпоративний парк, АЗС, міжнародні рейси.
- **6 статей** у розділі `/statti/`.
- **Юридичні сторінки:** оферта, конфіденційність.
- **Документи:** Silver Partner, авторизаційний лист Gurtam, сертифікати команди (Level 1 / Level 2).
- **SEO:** meta/OG/Twitter, canonical, JSON-LD (Organization, LocalBusiness, WebSite, Article, BreadcrumbList), `sitemap.xml`, `robots.txt`.
- **Аналітика:** UTM capture, `dataLayer` події для GTM/GA4/Meta.
- **Ліди:** форма з honeypot + serverless `/api/lead` (Telegram).

## Команди

```bash
npm install
npm run dev          # http://localhost:5173/km/
npm run build        # production у dist/ (BASE з env)
npm run build:pages  # збірка під GitHub Pages (/km/)
npm run preview
npm run check        # fuel-savings + sitemap/build перевірки
```

## Структура

```text
src/
  App.jsx              # маршрути, секції, форми, SEO meta/JSON-LD
  data.js              # контент: регіони, галузі, статті, сертифікати, контакти
  lib/fuelSavings.js   # модель економії пального
  lib/routes.js        # withBase / normalizePath
  content/oferta.jsx   # текст оферти
public/
  sitemap.xml          # карта сайту (km-trade.net)
  robots.txt
  assets/
    styles.css
    partners/          # логотипи партнерів
    certificates/      # PDF/JPG сертифікатів + preview
    fonts/             # Xolonium, Akrobat
api/lead.js            # Vercel serverless → Telegram
.github/workflows/     # деплой GitHub Pages
```

## Бренд

- Назва: **КМ Трейд** (без дефіса в назві бренду; домен `km-trade.net` без змін).
- Кольори: `#000000`, `#464C6E`, `#6272BD`, `#DBDCE9`.
- Шрифти: **Xolonium** (заголовки), **Akrobat** (текст/UI).
- Позиціонування партнера: **авторизований партнер Wialon / Gurtam в Україні**.
- Офіс: **у місті Чернівці**.

## Telegram-заявки

Форма тимчасово б’є в тунель розробника:

`POST https://nonastronomically-tasteful-booker.ngrok-free.dev/api/lead`

Тіло:

```json
{ "name": "...", "phone": "...", "cars": "4-10 авто", "region": "Чернівці" }
```

`cars` — **текст** з селекта (`1-3 авто`, `4-10 авто`, …).

Локальний fallback лишається в `api/lead.js` (Vercel), коли тунель приберуть.

## SEO-чекліст

- [x] Унікальні `<title>` і `description` на головній / регіонах / галузях / статтях
- [x] Canonical URL на `km-trade.net`
- [x] Open Graph + Twitter Card
- [x] JSON-LD: Organization, LocalBusiness, WebSite, Article, BreadcrumbList
- [x] `sitemap.xml` + `robots.txt`
- [x] `lang="uk"`, семантичні `h1`/`h2`, внутрішні лінки футера
- [ ] Підключити Search Console / Bing Webmaster на production-домені
- [ ] Перевірити індексацію після DNS / custom domain на Pages

## Що ще бажано від КМ Трейд

- 3 реальні відгуки клієнтів (ім’я, посада, компанія, регіон, 2–3 речення).
- Фото команди / офісу.
- Скріни Wialon для hero/кейсів.
- Цитата до кейсу «Два Відра».
- Юридичне погодження політики конфіденційності.
- Регіональні телефони, якщо відрізняються від загальних.
