# Client Nexus Portal — Online-кабінет

Оригінальна PHP-форма техпідтримки.

## Deploy (myVESTA / Apache)

1. Після `npm run build` у `dist/client-nexus-portal/` мають бути PHP-файли.
2. На сервері: `cp config.local.php.example config.local.php` і вписати DB + API token.
3. `uploads/` і `logs/` — writable для www-data.
4. Nginx/Apache не повинен віддавати SPA замість цієї папки (див. кореневий `.htaccess`).

## Endpoints

- `index.php` — форма заявки
- `api/get_list.php` — список заявок (token)
- `api/update_status.php` — статус `processed` (token)
