# Інструкція по міграції бази даних

## Додавання колонки ip_address для rate limiting

Для коректної роботи rate limiting потрібно додати колонку `ip_address` до таблиці `tech_support_requests`.

### Виконайте SQL запит:

```sql
ALTER TABLE `tech_support_requests`
ADD COLUMN `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP адреса клієнта' AFTER `files_links`;
```

Або виконайте файл: `assets/sql/add_ip_address.sql`

### Примітка

Якщо колонка не буде додана, rate limiting все одно працюватиме, але без прив'язки до IP адреси (загальна перевірка для всіх користувачів).

---

## Видалення колонок email і topic

Оскільки поля Email та Тема звернення були прибрані з форми та API, їх більше не потрібно зберігати в таблиці `tech_support_requests`.

### Виконайте SQL запит:

```sql
ALTER TABLE `tech_support_requests`
    DROP COLUMN `email`,
    DROP COLUMN `topic`;
```

Або виконайте файл: `assets/sql/drop_email_topic.sql`
