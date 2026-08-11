<?php
// health.php — used by the site to detect a live PHP portal (vs SPA catch-all)

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow', true);
header('Cache-Control: no-store');
portal_handle_preflight(['GET', 'OPTIONS']);

echo json_encode([
    'ok' => true,
    'portal' => 'client-nexus-portal',
    'path' => portal_base_path(),
    'time' => gmdate('c'),
], JSON_UNESCAPED_UNICODE);

