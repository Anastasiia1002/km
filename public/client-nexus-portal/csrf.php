<?php
// csrf.php — CSRF token for SPA / AJAX submit

header('X-Robots-Tag: noindex, nofollow', true);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'https://km-trade.net',
    'https://www.km-trade.net',
    'https://anastasiia1002.github.io',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
];
if ($origin && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

echo json_encode([
    'success' => true,
    'csrf_token' => generateCsrfToken(),
], JSON_UNESCAPED_UNICODE);
