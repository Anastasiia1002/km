<?php
// config.php

// Налаштування бази даних
define('DB_HOST', 'localhost');
define('DB_NAME', 'admin_support_requests');
define('DB_USER', 'admin_requests');
define('DB_PASS', 'SvMWilGMnx');

// Секретний токен для програміста BAF (API)
define('API_SECRET_KEY', 'a9f4b2c8d3e1_77x_kMt_TrAdE_55_z90_LpQ2');

// Базовий URL сайту (для формування посилань на файли в API)
define('BASE_URL', 'https://km-trade.net/client-nexus-portal/');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Помилка підключення до БД: " . $e->getMessage());
}
?>
