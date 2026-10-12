<?php
// bootstrap.php — shared helpers for the standalone portal page and API

declare(strict_types=1);

function portal_allowed_origins(): array
{
    return [
        'https://km-trade.net',
        'https://www.km-trade.net',
        'https://anastasiia1002.github.io',
        'http://localhost:4173',
        'http://localhost:5173',
        'http://127.0.0.1:4173',
        'http://127.0.0.1:5173',
    ];
}

function portal_base_path(): string
{
    $script = $_SERVER['SCRIPT_NAME'] ?? '/client-nexus-portal/index.php';
    $dir = str_replace('\\', '/', dirname($script));

    if ($dir === '/' || $dir === '.') {
        return '/';
    }

    return rtrim($dir, '/') . '/';
}

function portal_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    return (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function portal_start_session(): void
{
    if (session_status() !== PHP_SESSION_NONE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => portal_base_path(),
        'secure' => portal_is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

function portal_apply_cors(array $methods = ['GET', 'POST', 'OPTIONS']): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, portal_allowed_origins(), true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
        header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
        header('Vary: Origin');
    }
}

function portal_handle_preflight(array $methods = ['GET', 'POST', 'OPTIONS']): void
{
    portal_apply_cors($methods);

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function portal_wants_json(): bool
{
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $xhr = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';

    return stripos($accept, 'application/json') !== false
        || strcasecmp($xhr, 'XMLHttpRequest') === 0;
}

function portal_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function portal_asset_url(string $relativePath): string
{
    $relativePath = ltrim($relativePath, '/');
    return portal_base_path() . $relativePath;
}

function portal_site_asset_url(string $relativePath): string
{
    $relativePath = ltrim($relativePath, '/');
    $host = $_SERVER['HTTP_HOST'] ?? 'km-trade.net';
    $scheme = portal_is_https() ? 'https' : 'http';

    return $scheme . '://' . $host . '/' . $relativePath;
}
