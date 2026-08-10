<?php
// config.php — loads secrets from config.local.php (not committed)

declare(strict_types=1);

$localFile = __DIR__ . '/config.local.php';
if (!is_readable($localFile)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Online-кабінет не налаштований.\n";
    echo "Скопіюйте config.local.php.example → config.local.php і вкажіть дані БД.\n";
    exit;
}

require_once $localFile;

if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASS') || !defined('API_SECRET_KEY') || !defined('BASE_URL')) {
    http_response_code(500);
    die('Incomplete config.local.php');
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    die('Помилка підключення до БД. Зверніться до адміністратора.');
}
