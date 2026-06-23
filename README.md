# КМ-Трейд — GPS-моніторинг транспорту

React.js сайт для КМ-Трейд на основі прототипу I.DEAL.AGENCY і ТЗ v2.0. Проєкт зібраний на Vite + React.

## Що входить

- Головна сторінка з 17 секціями: hero, trust bar, болі, калькулятор, УТП, кейси, галузі, регіони, тарифи, тест-драйв, контакти.
- 4 регіональні SEO-сторінки:
  - `/gps-monitoring-chernivtsi/`
  - `/gps-monitoring-ivano-frankivsk/`
  - `/gps-monitoring-ternopil/`
  - `/gps-monitoring-khmelnytskyi/`
- 8 галузевих SEO-сторінок.
- 6 SEO-статей для запуску.
- `sitemap.xml`, `robots.txt`, canonical/meta description.
- Калькулятор економії, UTM capture, `dataLayer` події для GTM/GA4/Meta.
- Honeypot-антиспам і serverless endpoint `/api/lead` для Telegram-заявок.

## Команди

```bash
npm install
npm run dev
npm run build
npm run check
npm run preview
```

- `npm run dev` запускає React dev-server на Vite.
- `npm run build` збирає production bundle у `dist/`.
- `npm run preview` показує production build локально.
- `npm run check` перевіряє build-output, sitemap і ключові React-компоненти.

Локально відкривати після `npm run dev`:

```text
http://localhost:5173/km/
```

## GitHub Pages

Сайт автоматично деплоїться з гілки `main` через GitHub Actions.

Публічна адреса:

```text
https://anastasiia1002.github.io/km/
```

Команди для production-збірки під GitHub Pages:

```bash
npm run build:pages
npm run check
```

## Telegram-заявки

Для `/api/lead` потрібні змінні середовища:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Endpoint підготовлений у форматі Vercel Serverless Function.

## Структура

- `src/App.jsx` — React-компоненти, маршрути, форми, калькулятор, події аналітики.
- `src/data.js` — регіони, галузі, статті, тарифи і контентні блоки.
- `public/assets/styles.css` — стилі з прототипу, адаптовані під React.
- `public/sitemap.xml` і `public/robots.txt` — SEO-файли для production.
- `api/lead.js` — serverless endpoint для Telegram.

## Що потрібно отримати від КМ-Трейд перед запуском

- Реальна ціна трекера на 1 авто.
- Повний перелік функцій пакетів Стандарт / Комуналка / VIP.
- Умови обладнання для тарифу Комуналка.
- Дані для кейсів 2 і 3.
- Цитата та проблема до GPS для кейсу «Два відра».
- 3 реальні відгуки клієнтів.
- Фото команди або офісу.
- Скріни Wialon.
- Сертифікат або лого авторизованого партнера Gurtam.
- Регіональні телефони, якщо вони відрізняються від загальних.
