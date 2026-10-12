# Client Nexus Portal — Online-кабінет

Окрема PHP-сторінка форми техпідтримки: `https://km-trade.net/client-nexus-portal/`

Той самий бекенд використовує модалка Online-кабінет на головному сайті (JSON + CSRF).

## Чому сторінка «недоступна»

Nginx часто віддає **React SPA `index.html`** на будь-який шлях, включно з `/client-nexus-portal/`.
PHP-папки на диску або немає, або її перекриває `try_files … /index.html`.

## Встановлення на myVESTA / nginx

1. Збірка локально:
   ```bash
   npm run build
   ```
   У `dist/client-nexus-portal/` з’являться PHP-файли.

2. Залити вміст `dist/client-nexus-portal/` на сервер:
   ```
   /home/admin/web/km-trade.net/public_html/client-nexus-portal/
   ```
   **Не затирайте** `uploads/` і `config.local.php`, якщо вони уже є.

3. На сервері (один раз):
   ```bash
   cd /home/admin/web/km-trade.net/public_html/client-nexus-portal
   cp config.local.php.example config.local.php
   # Вписати DB_PASS та API_SECRET_KEY
   chmod 755 uploads logs
   ```

4. Додати в nginx `server { }` блок з **`nginx.snippet.conf`**  
   (`location ^~ /client-nexus-portal/` з php-fpm, **без** SPA fallback).

5. Перезавантажити nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```

## Перевірка після деплою

```bash
# PHP відповідає (не SPA HTML)
curl -s https://km-trade.net/client-nexus-portal/health.php

# Повний чеклист: config, БД, uploads, logs
curl -s https://km-trade.net/client-nexus-portal/install-check.php
```

Очікувані відповіді:
- `health.php` → `{"ok":true,"portal":"client-nexus-portal",...}`
- `install-check.php` → `"ready":true` коли все налаштовано

Локально перед деплоєм:
```bash
npm run check:portal
```

## Endpoints

| Файл | Призначення |
| --- | --- |
| `index.php` | Окрема сторінка форми (+ JSON при `Accept: application/json`) |
| `csrf.php` | CSRF-токен для модалки на сайті |
| `health.php` | Швидка перевірка, що nginx віддає PHP, а не SPA |
| `install-check.php` | Чеклист встановлення (config, БД, права на uploads/logs) |
| `api/get_list.php` | Список заявок для BAF |
| `api/update_status.php` | Оновлення статусу заявки |

## Файли, які не комітяться

- `config.local.php` — секрети БД і API-токен (лише на сервері)
- `uploads/*` — вкладення клієнтів
- `logs/actions.log` — журнал дій

## Apache (якщо без nginx)

Кореневий `public/.htaccess` уже виключає `/client-nexus-portal/` з SPA fallback.
У папці порталу — власний `.htaccess` (захист config, блок PHP у uploads).
