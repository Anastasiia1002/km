# 🚀 Швидкий старт API

## Мінімальні дані для програміста

### 1. API Токен

```
a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2
```

### 2. Base URL

```
https://km-trade.net/client-nexus-portal/api/
```

### 3. Endpoints

#### Отримати список нових заявок:

```
GET https://km-trade.net/client-nexus-portal/api/get_list.php?token=a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2&status=new
```

#### Оновити статус заявки:

```
POST https://km-trade.net/client-nexus-portal/api/update_status.php
Body: {
  "token": "a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2",
  "id": 1,
  "status": "processed"
}
```

---

## Приклади коду

### Python

```python
import requests

# Отримати нові заявки
response = requests.get(
    'https://km-trade.net/client-nexus-portal/api/get_list.php',
    params={
        'token': 'a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2',
        'status': 'new'
    }
)
requests_data = response.json()

# Оновити статус
response = requests.post(
    'https://km-trade.net/client-nexus-portal/api/update_status.php',
    json={
        'token': 'a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2',
        'id': 1,
        'status': 'processed'
    }
)
result = response.json()
```

### JavaScript/Node.js

```javascript
const axios = require("axios");

// Отримати нові заявки
const getRequests = async () => {
  const response = await axios.get(
    "https://km-trade.net/client-nexus-portal/api/get_list.php",
    {
      params: {
        token: "a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2",
        status: "new",
      },
    },
  );
  return response.data;
};

// Оновити статус
const updateStatus = async (id) => {
  const response = await axios.post(
    "https://km-trade.net/client-nexus-portal/api/update_status.php",
    {
      token: "a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2",
      id: id,
      status: "processed",
    },
  );
  return response.data;
};
```

### PHP

```php
<?php
// Отримати нові заявки
$url = 'https://km-trade.net/client-nexus-portal/api/get_list.php?token=a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2&status=new';
$response = file_get_contents($url);
$data = json_decode($response, true);

// Оновити статус
$url = 'https://km-trade.net/client-nexus-portal/api/update_status.php';
$data = [
    'token' => 'a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2',
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
?>
```

---

## Формат відповіді

### Список заявок:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company": "KM-Trade",
      "full_name": "Іван Іванов",
      "phone": "+380501234567",
      "message": "Опис проблеми...",
      "files_links": ["https://..."],
      "status": "new",
      "created_at": "2025-01-15 10:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Оновлення статусу:

```json
{
  "success": true,
  "message": "Status updated"
}
```

---

**Повна документація:** дивіться файл `API_DOCUMENTATION.md`
