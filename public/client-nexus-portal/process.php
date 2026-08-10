<?php
// process.php — прийом заявок з Online-кабінету

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

[$config, $pdo] = require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: https://km-trade.net');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    portal_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://km-trade.net',
    'https://www.km-trade.net',
    'https://anastasiia1002.github.io',
];
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

portal_ensure_schema($pdo);

$company = trim((string) ($_POST['company'] ?? ''));
$fullName = trim((string) ($_POST['full_name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$honeypot = trim((string) ($_POST['company_site'] ?? ''));

if ($honeypot !== '') {
    portal_json(['success' => true, 'message' => 'OK']);
}

$errors = [];
if ($company === '') {
    $errors['company'] = "Це поле обов'язкове для заповнення";
}
if ($fullName === '') {
    $errors['full_name'] = "Це поле обов'язкове для заповнення";
}
if ($phone === '' || !preg_match('/^[\+]?[0-9\s\-\(\)]{10,20}$/', $phone)) {
    $errors['phone'] = 'Невірний формат телефону';
}
if ($message === '') {
    $errors['message'] = "Це поле обов'язкове для заповнення";
} elseif (mb_strlen($message) > (int) $config['max_message_length']) {
    $errors['message'] = 'Максимальна довжина повідомлення: ' . (int) $config['max_message_length'] . ' символів';
}

if ($errors) {
    portal_json(['success' => false, 'error' => 'Validation failed', 'fields' => $errors], 400);
}

$ip = portal_client_ip();
$limit = (int) $config['rate_limit_per_hour'];
$rateStmt = $pdo->prepare(
    'SELECT COUNT(*) AS cnt FROM support_requests WHERE ip = :ip AND created_at >= (NOW() - INTERVAL 1 HOUR)'
);
$rateStmt->execute(['ip' => $ip]);
$count = (int) ($rateStmt->fetchColumn() ?: 0);
if ($count >= $limit) {
    portal_json([
        'success' => false,
        'error' => 'Перевищено ліміт заявок. Спробуйте пізніше (макс. 5 на годину).',
    ], 429);
}

$allowedExt = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
$uploadsDir = __DIR__ . '/uploads';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$fileLinks = [];
$files = $_FILES['files'] ?? null;
if ($files && isset($files['name']) && is_array($files['name'])) {
    $total = count($files['name']);
    if ($total > (int) $config['max_files']) {
        portal_json([
            'success' => false,
            'error' => 'Максимальна кількість файлів — ' . (int) $config['max_files'],
        ], 400);
    }

    for ($i = 0; $i < $total; $i++) {
        if (($files['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if (($files['error'][$i] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            portal_json(['success' => false, 'error' => 'Помилка завантаження файлу'], 400);
        }
        $size = (int) ($files['size'][$i] ?? 0);
        if ($size <= 0 || $size > (int) $config['max_file_size']) {
            portal_json(['success' => false, 'error' => 'Файл занадто великий. Максимум 1МБ.'], 400);
        }

        $original = (string) $files['name'][$i];
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) {
            portal_json(['success' => false, 'error' => 'Непідтримуваний тип файлу'], 400);
        }

        $safeName = 'file_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $target = $uploadsDir . '/' . $safeName;
        if (!move_uploaded_file((string) $files['tmp_name'][$i], $target)) {
            portal_json(['success' => false, 'error' => 'Не вдалося зберегти файл'], 500);
        }

        $fileLinks[] = rtrim((string) $config['base_url'], '/') . '/uploads/' . $safeName;
    }
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO support_requests (company, full_name, phone, message, files_links, status, created_at, ip)
         VALUES (:company, :full_name, :phone, :message, :files_links, :status, NOW(), :ip)'
    );
    $stmt->execute([
        'company' => mb_substr($company, 0, 255),
        'full_name' => mb_substr($fullName, 0, 255),
        'phone' => mb_substr($phone, 0, 64),
        'message' => $message,
        'files_links' => json_encode($fileLinks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'status' => 'new',
        'ip' => $ip,
    ]);
} catch (Throwable $e) {
    portal_json([
        'success' => false,
        'error' => 'Помилка збереження заявки. Зверніться до адміністратора.',
    ], 500);
}

portal_json([
    'success' => true,
    'message' => 'Заявку прийнято. Ми зв\'яжемося з вами найближчим часом.',
    'id' => (int) $pdo->lastInsertId(),
]);
