<?php
// api/auth.php

// Переконуємось, що конфігурація підключена
if (!defined('API_SECRET_KEY')) {
    // __DIR__ вказує на поточну папку (api), тому виходимо на рівень вище до config.php
    require_once __DIR__ . '/../config.php';
}

// Отримуємо токен з різних джерел: GET, POST або JSON body
$input_json = json_decode(file_get_contents('php://input'), true);
$incoming_token = $_GET['token'] ?? $_POST['token'] ?? $input_json['token'] ?? '';

// Перевірка
if ($incoming_token !== API_SECRET_KEY) {
    // Якщо токен не співпадає - повертаємо помилку і ЗУПИНЯЄМО скрипт
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode([
        'error' => true,
        'message' => 'Access Denied: Invalid or missing authentication token'
    ]);
    exit; // Важливо: далі код не виконується
}

// Якщо код дійшов сюди — значить токен вірний
?>
