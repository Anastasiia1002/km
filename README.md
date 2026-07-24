# КМ Трейд — GPS-моніторинг транспорту

React.js сайт для КМ Трейд на основі прототипу I.DEAL.AGENCY і ТЗ v2.0. Проєкт зібраний на Vite + React.

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
- Плаваючий AI-консультант (FAB + чат-панель) з проксі `/api/chat` для підключення зовнішнього AI-агента.

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

## AI-консультант (плаваюча кнопка)

На всіх сторінках є FAB «Питання?» і чат-панель. UI готовий; відповіді йдуть через `/api/chat`.

### Що має надати розробник / інтегратор агента

1. **`AI_AGENT_API_URL`** — URL API агента (секрет на сервері, не в фронтенді).
2. **`AI_AGENT_API_KEY`** — ключ авторизації (`Authorization: Bearer …`).
3. **`AI_AGENT_MODE`** (опційно):
   - `openai` (за замовчуванням) — OpenAI-compatible `chat/completions`;
   - `webhook` — кастомний webhook: `{ messages, sessionId, page, system }`, очікується `{ reply }` / `{ message }` / `{ answer }`.
4. **`AI_AGENT_MODEL`** (опційно) — назва моделі, напр. `gpt-4o-mini`.
5. **`AI_AGENT_SYSTEM`** (опційно) — system prompt (база знань / тон агента).
6. **База знань агента** — тарифи, умови тест-драйву, регіони, FAQ (на боці агента або в system prompt).
7. **Hosting для `/api/*`** — зараз site на GitHub Pages; serverless `api/chat.js` і `api/lead.js` потребують Vercel (або аналог) з цими env vars.

Публічний прапорець (опційно):

```bash
VITE_AI_ASSISTANT_ENABLED=true   # false — повністю сховати віджет
```

Тексти віджета (ім'я, привітання, підказки): `src/lib/aiConfig.js`.

Компоненти:

- `src/components/AiAssistant.jsx` — FAB + чат
- `api/chat.js` — проксі до AI-агента
- стилі — `.ai-*` у `public/assets/styles.css`

### Приклад env для підключення

```bash
AI_AGENT_API_URL=https://api.openai.com/v1/chat/completions
AI_AGENT_API_KEY=sk-...
AI_AGENT_MODEL=gpt-4o-mini
AI_AGENT_MODE=openai
AI_AGENT_SYSTEM=Ти консультант КМ Трейд...
```

Без `AI_AGENT_API_URL` / `AI_AGENT_API_KEY` чат показує повідомлення, що агент ще не підключений (UI працює, відповідей від моделі немає).

## Структура

- `src/App.jsx` — React-компоненти, маршрути, форми, калькулятор, події аналітики.
- `src/components/AiAssistant.jsx` — плаваючий AI-чат.
- `src/lib/aiConfig.js` — публічні тексти/налаштування AI-віджета.
- `src/data.js` — регіони, галузі, статті, тарифи і контентні блоки.
- `public/assets/styles.css` — стилі з прототипу, адаптовані під React.
- `public/sitemap.xml` і `public/robots.txt` — SEO-файли для production.
- `api/lead.js` — serverless endpoint для Telegram.
- `api/chat.js` — serverless proxy для AI-агента.

## Що потрібно отримати від КМ Трейд перед запуском

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
