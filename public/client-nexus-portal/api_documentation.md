# Документація API для технічної підтримки KM-Trade

## 🔑 Автентифікація

Всі запити до API вимагають передачі секретного токену. Токен можна передавати одним з трьох способів:

- Як GET параметр: `?token=ВАШ_ТОКЕН`
- Як POST параметр: `token=ВАШ_ТОКЕН`
- В JSON body: `{"token": "ВАШ_ТОКЕН", ...}`

**Ваш API токен:** `YOUR_API_TOKEN`

⚠️ **ВАЖЛИВО:** Зберігайте токен в безпеці та не публікуйте його в публічних репозиторіях!

---

## 📋 Endpoint 1: Отримання списку заявок

### URL

```
https://km-trade.net/client-nexus-portal/api/get_list.php
```

### Метод

`GET` або `POST`

### Параметри запиту

| Параметр    | Тип     | Обов'язковий | Опис                                         | Приклад                                  |
| ----------- | ------- | ------------ | -------------------------------------------- | ---------------------------------------- |
| `token`     | string  | ✅ Так       | API токен                                    | `YOUR_API_TOKEN` |
| `status`    | string  | ❌ Ні        | Фільтр по статусу: `new`, `processed`, `all` | `new` (за замовчуванням)                 |
| `page`      | integer | ❌ Ні        | Номер сторінки (починається з 1)             | `1` (за замовчуванням)                   |
| `limit`     | integer | ❌ Ні        | Кількість записів на сторінці (макс 100)     | `50` (за замовчуванням)                  |
| `date_from` | string  | ❌ Ні        | Фільтр від дати (формат: YYYY-MM-DD)         | `2025-01-01`                             |
| `date_to`   | string  | ❌ Ні        | Фільтр до дати (формат: YYYY-MM-DD)          | `2025-01-31`                             |

### Приклади запитів

#### cURL (GET)

```bash
curl "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new&page=1&limit=50"
```

#### cURL (POST з JSON)

```bash
curl -X POST "https://km-trade.net/client-nexus-portal/api/get_list.php" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_API_TOKEN",
    "status": "new",
    "page": 1,
    "limit": 50
  }'
```

#### JavaScript (fetch)

```javascript
const response = await fetch(
  "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new&page=1&limit=50",
);
const data = await response.json();
console.log(data);
```

#### PHP

```php
$url = 'https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new&page=1&limit=50';
$response = file_get_contents($url);
$data = json_decode($response, true);
print_r($data);
```

### Формат відповіді (успіх)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company": "KM-Trade",
      "full_name": "Шевченко Тарас",
      "phone": "+380501234567",
      "message": "Опис проблеми...",
      "files_links": [
        "https://km-trade.net/client-nexus-portal/uploads/file_1234567890.png"
      ],
      "status": "new",
      "created_at": "2025-01-15 10:30:00",
      "processed_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  },
  "filters": {
    "status": "new"
  }
}
```

### Формат відповіді (помилка)

```json
{
  "success": false,
  "error": "Помилка отримання даних. Зверніться до адміністратора."
}
```

### Коди відповідей

- `200` - Успішний запит
- `403` - Невалідний або відсутній токен
- `500` - Помилка сервера

---

## ✅ Endpoint 2: Оновлення статусу заявки

### URL

```
https://km-trade.net/client-nexus-portal/api/update_status.php
```

### Метод

`POST`

### Параметри запиту

| Параметр | Тип     | Обов'язковий | Опис                        | Приклад                                  |
| -------- | ------- | ------------ | --------------------------- | ---------------------------------------- |
| `token`  | string  | ✅ Так       | API токен                   | `YOUR_API_TOKEN` |
| `id`     | integer | ✅ Так       | ID заявки (позитивне число) | `1`                                      |
| `status` | string  | ✅ Так       | Статус (завжди `processed`) | `processed`                              |

### Приклади запитів

#### cURL (POST з параметрами)

```bash
curl -X POST "https://km-trade.net/client-nexus-portal/api/update_status.php" \
  -d "token=YOUR_API_TOKEN" \
  -d "id=1" \
  -d "status=processed"
```

#### cURL (POST з JSON)

```bash
curl -X POST "https://km-trade.net/client-nexus-portal/api/update_status.php" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_API_TOKEN",
    "id": 1,
    "status": "processed"
  }'
```

#### JavaScript (fetch)

```javascript
const response = await fetch(
  "https://km-trade.net/client-nexus-portal/api/update_status.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: "YOUR_API_TOKEN",
      id: 1,
      status: "processed",
    }),
  },
);
const data = await response.json();
console.log(data);
```

#### PHP

```php
$url = 'https://km-trade.net/client-nexus-portal/api/update_status.php';
$data = [
    'token' => 'YOUR_API_TOKEN',
    'id' => 1,
    'status' => 'processed'
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$result = json_decode($response, true);
print_r($result);
```

### Формат відповіді (успіх)

```json
{
  "success": true,
  "message": "Status updated"
}
```

### Формат відповіді (помилка - заявка не знайдена)

```json
{
  "success": false,
  "message": "ID not found or already processed"
}
```

### Формат відповіді (помилка - невалідні дані)

```json
{
  "error": "Missing ID or invalid status"
}
```

### Коди відповідей

- `200` - Успішне оновлення
- `400` - Невалідні параметри (відсутній ID або невірний статус)
- `403` - Невалідний або відсутній токен
- `500` - Помилка сервера

---

## 📝 Типові сценарії використання

### Сценарій 1: Отримати всі нові заявки

```bash
curl "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new"
```

### Сценарій 2: Отримати заявки з пагінацією

```bash
curl "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new&page=2&limit=10"
```

### Сценарій 3: Отримати заявки за період

```bash
curl "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=all&date_from=2025-01-01&date_to=2025-01-31"
```

### Сценарій 4: Позначити заявку як оброблену

```bash
curl -X POST "https://km-trade.net/client-nexus-portal/api/update_status.php" \
  -d "token=YOUR_API_TOKEN" \
  -d "id=1" \
  -d "status=processed"
```

### Сценарій 5: Повний цикл обробки заявки (JavaScript)

```javascript
// 1. Отримати нові заявки
const getRequests = async () => {
  const response = await fetch(
    "https://km-trade.net/client-nexus-portal/api/get_list.php?token=YOUR_API_TOKEN&status=new",
  );
  const data = await response.json();
  return data.data; // масив заявок
};

// 2. Обробити заявку
const processRequest = async (requestId) => {
  const response = await fetch(
    "https://km-trade.net/client-nexus-portal/api/update_status.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "YOUR_API_TOKEN",
        id: requestId,
        status: "processed",
      }),
    },
  );
  const data = await response.json();
  return data;
};

// Використання
const requests = await getRequests();
for (const request of requests) {
  console.log(`Обробляю заявку #${request.id} від телефону ${request.phone}`);
  // ... ваша логіка обробки ...
  await processRequest(request.id);
  console.log(`Заявка #${request.id} оброблена`);
}
```

---

## 🔒 Безпека

1. **Токен:** Ніколи не публікуйте токен в публічних місцях (GitHub, форуми тощо)
2. **HTTPS:** Всі запити виконуються через HTTPS
3. **Rate Limiting:** На формі є обмеження 5 заявок на годину з одного IP
4. **Валідація:** Всі параметри валідуються на сервері

---

## 📞 Підтримка

При виникненні проблем звертайтеся до адміністратора системи.

---

## 📌 Швидка довідка

**API токен:** `YOUR_API_TOKEN`

**Base URL:** `https://km-trade.net/client-nexus-portal/api/`

**Endpoints:**

- `get_list.php` - отримання списку заявок
- `update_status.php` - оновлення статусу заявки

**Статуси заявок:**

- `new` - нова заявка
- `processed` - оброблена заявка
