<?php
// api/get_list.php
header('Content-Type: application/json');
// Спочатку підключаємо захист. Якщо токен невірний, скрипт зупиниться всередині auth.php
require_once 'auth.php';

try {
    // Отримуємо параметри пагінації та фільтрів
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50; // Максимум 100
    $offset = ($page - 1) * $limit;

    $status = isset($_GET['status']) ? $_GET['status'] : 'new';
    $status = in_array($status, ['new', 'processed', 'all']) ? $status : 'new';

    // Побудова запиту з фільтрами
    $where = [];
    $params = [];

    if ($status !== 'all') {
        $where[] = "status = ?";
        $params[] = $status;
    }

    // Фільтр по даті (опціонально)
    if (isset($_GET['date_from']) && !empty($_GET['date_from'])) {
        $where[] = "DATE(created_at) >= ?";
        $params[] = $_GET['date_from'];
    }

    if (isset($_GET['date_to']) && !empty($_GET['date_to'])) {
        $where[] = "DATE(created_at) <= ?";
        $params[] = $_GET['date_to'];
    }

    $where_clause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

    // Підрахунок загальної кількості
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM tech_support_requests $where_clause");
    $count_stmt->execute($params);
    $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Отримання записів з пагінацією (без полів email та topic)
    // LIMIT / OFFSET підставляємо напряму як цілі числа, оскільки деякі версії MariaDB/MySQL
    // не підтримують параметризовані плейсхолдери для цих операторів.
    $sql = "SELECT id, company, full_name, phone, message, files_links, status, created_at, processed_at
            FROM tech_support_requests
            $where_clause
            ORDER BY created_at DESC
            LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Форматуємо вивід (додаємо повні шляхи до файлів)
    foreach ($requests as &$req) {
        $files = json_decode($req['files_links'], true);
        $full_urls = [];
        if (is_array($files)) {
            foreach ($files as $file) {
                $full_urls[] = BASE_URL . $file;
            }
        }
        $req['files_links'] = $full_urls;
        // Прибираємо IP адресу з відповіді (безпека)
        unset($req['ip_address']);
    }

    // Формуємо відповідь з метаданими пагінації
    $response = [
        'success' => true,
        'data' => $requests,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'pages' => ceil($total / $limit)
        ],
        'filters' => [
            'status' => $status
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    // Не показуємо деталі помилки БД клієнту
    echo json_encode([
        'success' => false,
        'error' => 'Помилка отримання даних. Зверніться до адміністратора.'
    ], JSON_UNESCAPED_UNICODE);
    // Логування для розробників
    error_log("API get_list error: " . $e->getMessage());
}
?>
