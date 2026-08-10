<?php
// api/get_list.php — список заявок для інтеграції BAF

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib.php';

[$config, $pdo] = require dirname(__DIR__) . '/config.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    portal_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = portal_read_input();
portal_require_token($input, $config);
portal_ensure_schema($pdo);

$status = strtolower(trim((string) ($input['status'] ?? 'new')));
if (!in_array($status, ['new', 'processed', 'all'], true)) {
    $status = 'new';
}

$page = max(1, (int) ($input['page'] ?? 1));
$limit = (int) ($input['limit'] ?? 50);
if ($limit < 1) {
    $limit = 50;
}
if ($limit > 100) {
    $limit = 100;
}
$offset = ($page - 1) * $limit;

$dateFrom = trim((string) ($input['date_from'] ?? ''));
$dateTo = trim((string) ($input['date_to'] ?? ''));

$where = [];
$params = [];

if ($status !== 'all') {
    $where[] = 'status = :status';
    $params['status'] = $status;
}
if ($dateFrom !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
    $where[] = 'DATE(created_at) >= :date_from';
    $params['date_from'] = $dateFrom;
}
if ($dateTo !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
    $where[] = 'DATE(created_at) <= :date_to';
    $params['date_to'] = $dateTo;
}

$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

try {
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM support_requests $whereSql");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $sql = "SELECT id, company, full_name, phone, message, files_links, status, created_at, processed_at
            FROM support_requests
            $whereSql
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue(':' . $key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
} catch (Throwable $e) {
    portal_json([
        'success' => false,
        'error' => 'Помилка отримання даних. Зверніться до адміністратора.',
    ], 500);
}

$data = array_map(static function (array $row): array {
    $links = [];
    if (!empty($row['files_links'])) {
        $decoded = json_decode((string) $row['files_links'], true);
        if (is_array($decoded)) {
            $links = $decoded;
        }
    }
    return [
        'id' => (int) $row['id'],
        'company' => $row['company'],
        'full_name' => $row['full_name'],
        'phone' => $row['phone'],
        'message' => $row['message'],
        'files_links' => $links,
        'status' => $row['status'],
        'created_at' => $row['created_at'],
        'processed_at' => $row['processed_at'],
    ];
}, $rows);

portal_json([
    'success' => true,
    'data' => $data,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'pages' => max(1, (int) ceil($total / max(1, $limit))),
    ],
    'filters' => [
        'status' => $status,
    ],
]);
