# КМ Трейд — GPS-моніторинг транспорту

Сайт авторизованого партнера **Wialon / Gurtam** для GPS-моніторингу автопарків.
Стек: **React 19 + Vite 8**, деплой на **GitHub Pages** з гілки `main`.

## Публічні адреси

| Середовище | URL |
| --- | --- |
| Production (canonical) | https://km-trade.net/ |
| GitHub Pages (preview) | https://anastasiia1002.github.io/km/ |

Canonical, `sitemap.xml` і `robots.txt` налаштовані на **km-trade.net**.

## Деплой на myVESTA (заміна головного сайту)

Ціль: залити сайт у корінь `https://km-trade.net/`  
Шлях на сервері: `/home/admin/web/km-trade.net/public_html/`

### 1. Збірка локально

```bash
npm ci
npm run build          # VITE_BASE=/ → папка dist/
npm run check
```

У `dist/` має бути `index.html`, `assets/`, `sitemap.xml`, `robots.txt`, `.htaccess`.

### 2. Що попросити в клієнта перед заливкою

- Доступ до myVESTA **File Manager** або SFTP.
- Дозвіл зробити **бекап** поточного `public_html`.
- Підтвердження, що треба **зберегти** існуючі папки (обов’язково перевірте):
  - `client-nexus-portal/` (клієнтський портал у меню сайту)
  - будь-які інші службові каталоги/скрипти, яких немає в нашому `dist/`

### 3. Заливка (безпечний порядок)

1. У File Manager відкрити `/home/admin/web/km-trade.net/public_html/`.
2. Зробити архів-бекап усього `public_html` (Download / Archive).
3. **Не видаляти** `client-nexus-portal/` та інші папки клієнта.
4. Залити вміст `dist/` **поверх** кореня `public_html` (файли сайту + `.htaccess`).
5. Перевірити, що `.htaccess` потрапив у корінь (у File Manager увімкніть показ прихованих файлів, якщо треба).
6. Відкрити:
   - https://km-trade.net/
   - будь-який внутрішній URL напряму, напр. https://km-trade.net/statti/  
     (має відкритись сайт, а не 404 сервера — це перевірка SPA fallback)
   - https://km-trade.net/client-nexus-portal/ (має лишитись робочим)

### 4. Якщо прямі URL дають 404

На myVESTA стоїть Apache за nginx proxy — потрібен `.htaccess` (уже в `public/` → копіюється в `dist/`).  
У панелі WEB для `km-trade.net` залиште:

- SSL: Let’s Encrypt  
- Proxy: yes + `force-https`  
- Web template: `default` (зазвичай достатньо)

Якщо rewrite не спрацьовує — увімкніть `mod_rewrite` / дозвольте `.htaccess` для домену (підтримка хостингу).

### 5. Форма заявок (Telegram)

Зараз форма б’є в тимчасовий зовнішній endpoint (`ngrok`).  
На myVESTA **немає** Vercel `/api/lead` — після виходу в прод потрібен постійний backend (PHP на сервері або інший HTTPS endpoint). Без цього сайт відкриється, але заявки можуть не доходити.

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
npm run dev          # http://localhost:5173/  (корінь, як на km-trade.net)
npm run dev:pages    # http://localhost:5173/km/ (як GitHub Pages)
npm run build        # production у dist/ для кореня km-trade.net (default)
npm run build:root   # те саме явно (VITE_BASE=/)
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
- [ ] Перевірити індексацію після деплою на km-trade.net

## Що ще бажано від КМ Трейд

- Фото команди / офісу.
- Скріни Wialon для hero/кейсів.
- Цитата до кейсу «Два Відра».
- Юридичне погодження політики конфіденційності.
- Регіональні телефони, якщо відрізняються від загальних.
