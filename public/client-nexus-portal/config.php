<?php
// config.php — підключає локальні секрети з config.local.php

declare(strict_types=1);

$defaults = [
    'db_host' => getenv('KM_SUPPORT_DB_HOST') ?: 'localhost',
    'db_name' => getenv('KM_SUPPORT_DB_NAME') ?: 'admin_support_requests',
    'db_user' => getenv('KM_SUPPORT_DB_USER') ?: 'admin_requests',
    'db_pass' => getenv('KM_SUPPORT_DB_PASS') ?: '',
    'api_secret_key' => getenv('KM_SUPPORT_API_KEY') ?: '',
    'base_url' => getenv('KM_SUPPORT_BASE_URL') ?: 'https://km-trade.net/client-nexus-portal/',
    'rate_limit_per_hour' => 5,
    'max_file_size' => 1048576,
    'max_files' => 5,
    'max_message_length' => 5000,
];

$localFile = __DIR__ . '/config.local.php';
$local = [];
if (is_readable($localFile)) {
    $loaded = require $localFile;
    if (is_array($loaded)) {
        $local = $loaded;
    }
}

$config = array_merge($defaults, $local);

if ($config['db_pass'] === '' || $config['api_secret_key'] === '') {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Support portal is not configured. Copy config.example.php to config.local.php on the server.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Помилка підключення до БД. Зверніться до адміністратора.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

return [$config, $pdo];
