# КМ-Трейд — GPS-моніторинг транспорту

Статичний багатосторінковий сайт для КМ-Трейд на основі прототипу I.DEAL.AGENCY і ТЗ v2.0.

## Що входить

- Головна сторінка з 17 секціями: hero, trust bar, болі, калькулятор, УТП, кейси, галузі, регіони, тарифи, тест-драйв, контакти.
- 4 регіональні SEO-сторінки:
  - `/gps-monitoring-chernivtsi/`
  - `/gps-monitoring-ivano-frankivsk/`
  - `/gps-monitoring-ternopil/`
  - `/gps-monitoring-khmelnytskyi/`
- 8 галузевих SEO-сторінок.
- 6 SEO-статей для запуску.
- `sitemap.xml`, `robots.txt`, canonical/meta description, LocalBusiness schema.
- Калькулятор економії, UTM capture, `dataLayer` події для GTM/GA4/Meta.
- Honeypot-антиспам і serverless endpoint `/api/lead` для Telegram-заявок.

## Команди

```bash
npm run build
npm run check
```

Згенерований сайт потрапляє у `public/`.

## Telegram-заявки

Для `/api/lead` потрібні змінні середовища:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Endpoint підготовлений у форматі Vercel Serverless Function.

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
