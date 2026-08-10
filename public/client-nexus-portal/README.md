# Client Nexus Portal (Online-кабінет)

PHP backend for support requests used by the site modal **Online-кабінет**.

## Setup on myVESTA / Apache

1. Deploy site `dist/` so `client-nexus-portal/` is present under `public_html/`.
2. Copy `config.example.php` → `config.local.php` and fill DB + API token.
3. Ensure MySQL database/user exist (or let `process.php` / API auto-create `support_requests` table).
4. Make `uploads/` writable by the web server (`chmod 755` or `775`).

## Endpoints

| URL | Method | Purpose |
| --- | --- | --- |
| `/client-nexus-portal/process.php` | POST multipart | Create support request |
| `/client-nexus-portal/api/get_list.php` | GET/POST | List requests (token) |
| `/client-nexus-portal/api/update_status.php` | POST | Mark request processed (token) |

Form fields: `company`, `full_name`, `phone`, `message`, `files[]` (optional).

Do **not** commit `config.local.php`.
