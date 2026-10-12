<?php
// install-check.php — server-side checklist after deploying client-nexus-portal/

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('X-Robots-Tag: noindex, nofollow', true);
portal_handle_preflight(['GET', 'OPTIONS']);

function portal_dir_writable(string $dir): bool
{
    if (is_dir($dir)) {
        return is_writable($dir);
    }

    return @mkdir($dir, 0755, true) && is_writable($dir);
}

$checks = [
    'php' => [
        'ok' => version_compare(PHP_VERSION, '8.0.0', '>='),
        'version' => PHP_VERSION,
    ],
    'portal_path' => [
        'ok' => true,
        'path' => portal_base_path(),
    ],
    'config_local' => [
        'ok' => is_readable(__DIR__ . '/config.local.php'),
    ],
    'uploads_writable' => [
        'ok' => portal_dir_writable(__DIR__ . '/uploads'),
    ],
    'logs_writable' => [
        'ok' => portal_dir_writable(__DIR__ . '/logs'),
    ],
    'session' => [
        'ok' => function_exists('session_start'),
    ],
];

$configLocal = __DIR__ . '/config.local.php';
if ($checks['config_local']['ok']) {
    try {
        require_once __DIR__ . '/config.php';
        $pdo->query('SELECT 1');
        $checks['database'] = ['ok' => true];
    } catch (Throwable $e) {
        $checks['database'] = ['ok' => false, 'error' => 'connection_failed'];
    }
} else {
    $checks['database'] = ['ok' => false, 'error' => 'config_missing'];
}

$allOk = true;
foreach ($checks as $check) {
    if (empty($check['ok'])) {
        $allOk = false;
        break;
    }
}

portal_json_response([
    'ok' => $allOk,
    'portal' => 'client-nexus-portal',
    'ready' => $allOk,
    'checks' => $checks,
    'time' => gmdate('c'),
], $allOk ? 200 : 503);
