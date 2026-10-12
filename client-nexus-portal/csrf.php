<?php
// csrf.php — CSRF token for SPA / AJAX submit

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

header('X-Robots-Tag: noindex, nofollow', true);
portal_handle_preflight(['GET', 'OPTIONS']);
portal_start_session();

portal_json_response([
    'success' => true,
    'csrf_token' => generateCsrfToken(),
]);
