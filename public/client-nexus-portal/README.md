# Client Nexus Portal — Online-кабінет

Оригінальна PHP-форма техпідтримки.

## Чому https://km-trade.net/client-nexus-portal/ «недоступний»

Зараз nginx віддає **React SPA `index.html`** на будь-який шлях (у т.ч. `/client-nexus-portal/`).
PHP-папки на диску або немає, або її перекриває `try_files … /index.html`.

## Що зробити на myVESTA / nginx

1. Збірка: `npm run build` → у `dist/client-nexus-portal/` будуть PHP-файли.
2. Залити `dist/client-nexus-portal/` у  
   `/home/admin/web/km-trade.net/public_html/client-nexus-portal/`  
   (**не затирати**, якщо папка вже є з uploads).
3. На сервері:
   ```bash
   cp config.local.php.example config.local.php
   # вписати DB_PASS + API_SECRET_KEY
   chmod 755 uploads logs
   ```
4. Додати в nginx `server { }` блок з файлу **`nginx.snippet.conf`**  
   (location `^~ /client-nexus-portal/` з php-fpm, **без** SPA fallback).
5. `nginx -t && systemctl reload nginx` (або через панель myVESTA).

Перевірка:
```bash
curl -s https://km-trade.net/client-nexus-portal/health.php
# {"ok":true,"portal":"client-nexus-portal",...}
```

## Endpoints

- `index.php` — форма (+ JSON при `Accept: application/json`)
- `csrf.php` — CSRF для SPA-модалки
- `health.php` — перевірка, що це PHP, а не SPA
- `api/get_list.php` / `api/update_status.php` — API BAF
