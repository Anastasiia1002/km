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
- **Ліди:** форма з honeypot + `POST https://km-trade.net/api/lead` (Telegram).
- **Online-кабінет:** оригінальна PHP-форма (`public/client-nexus-portal/`) — окрема сторінка на production і модалка на сайті. Клік у «Про компанію» / футері відкриває форму. API BAF: `get_list.php`, `update_status.php`.

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
server/processLead.js  # спільна логіка заявки (валідація + Telegram)
vercel.json            # налаштування функції /api/lead
.env.example           # лише фронт: VITE_BASE, VITE_LEAD_API_URL
.github/workflows/     # деплой GitHub Pages
```

## Бренд

- Назва: **КМ Трейд** (без дефіса в назві бренду; домен `km-trade.net` без змін).
- Кольори: `#000000`, `#464C6E`, `#6272BD`, `#DBDCE9`.
- Шрифти: **Xolonium** (заголовки), **Akrobat** (текст/UI).
- Позиціонування партнера: **авторизований партнер Wialon / Gurtam в Україні**.
- Офіс: **у місті Чернівці**.

## Telegram-заявки (`POST https://km-trade.net/api/lead`)

Форма «Залишити заявку» надсилає `POST` на `https://km-trade.net/api/lead`
(можна перевизначити через `VITE_LEAD_API_URL`; локально — Vite middleware на `/api/lead`).

### Тіло запиту

```json
{
  "name": "Іван Коваленко",
  "phone": "+38 095 058-43-85",
  "cars": "4-10 авто",
  "region": "Чернівці",
  "savings": "12 400 грн/міс",
  "page": "/km/",
  "context": "header",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": ""
}
```

`cars` — **текст** з селекта (`1-3 авто`, `4-10 авто`, …).  
`context` — з якого CTA / блоку користувач перейшов до форми (зберігається в `sessionStorage` до сабміту).  
Поле `company_site` — honeypot (ботів тихо ігноруємо).

### Можливі значення `context`

| Значення | Де кнопка |
| --- | --- |
| `header` | Десктоп-кнопка «Залишити заявку» в хедері |
| `header_mobile` | Кнопка в мобільному меню |
| `hero` | Герой головної сторінки |
| `calculator` | Калькулятор економії пального |
| `how_it_works` | Блок «Як ми працюємо» |
| `pricing` | Картки тарифів («Обрати пакет») |
| `pricing_calculator` | Міні-калькулятор у блоці цін |
| `contacts` | Картка контактів у блоці About |
| `region_hero` | Герой регіональної сторінки |
| `industry_hero` | Герой галузевої сторінки (включно з доставкою `/gps-dlya-dostavky/`) |
| `region_cta` | CTA-бокс у тексті регіональної сторінки |
| `industry_cta` | CTA-бокс у тексті галузевої сторінки |
| `article_cta` | CTA-бокс у статті |
| `sidebar` | Сайдбар «КМ Трейд поруч» |
| `sticky_cta` | Нижня sticky-кнопка на мобільних |
| `trial_form` | Форму заповнили без попереднього кліку по CTA |

Сторінку (наприклад доставка) дивіться в полі `page` разом із `context`.

### Відповіді

| Status | Значення |
| --- | --- |
| `200` | Заявку відправлено в Telegram |
| `202` | Honeypot / Telegram ще не налаштований (ок для клієнта) |
| `400` | Невалідні ім’я або телефон |
| `405` | Не `POST` |
| `502` | Telegram API не прийняв повідомлення |

### Налаштування

1. На проді API доступний як **`https://km-trade.net/api/lead`** (`api/lead.js` / той самий handler на хості).
2. **`TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` — лише на сервері API** (не у фронт / не в Vite). Без них заявка приймається, але в Telegram не йде.
3. У GitHub Actions secrets (для Pages) додайте  
   `VITE_LEAD_API_URL` = `https://km-trade.net/api/lead`.
4. Локально: скопіюйте `.env.example` → `.env` (лише `VITE_*`). Для локального `/api/lead` токени Telegram можна передати в shell env процесу `npm run dev`, не в клієнтський бандл.

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

- Фото команди / офісу.
- Скріни Wialon для hero/кейсів.
- Цитата до кейсу «Два Відра».
- Юридичне погодження політики конфіденційності.
- Регіональні телефони, якщо відрізняються від загальних.
