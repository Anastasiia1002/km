<?php
// health.php — used by the site to detect a live PHP portal (vs SPA catch-all)

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow', true);
header('Cache-Control: no-store');

echo json_encode([
    'ok' => true,
    'portal' => 'client-nexus-portal',
    'time' => gmdate('c'),
], JSON_UNESCAPED_UNICODE);
