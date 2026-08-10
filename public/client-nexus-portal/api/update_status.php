<?php
// api/update_status.php — позначити заявку як оброблену

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib.php';

[$config, $pdo] = require dirname(__DIR__) . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    portal_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = portal_read_input();
portal_require_token($input, $config);
portal_ensure_schema($pdo);

$id = (int) ($input['id'] ?? 0);
$status = strtolower(trim((string) ($input['status'] ?? '')));

if ($id <= 0 || $status !== 'processed') {
    portal_json(['error' => 'Missing ID or invalid status'], 400);
}

try {
    $stmt = $pdo->prepare(
        "UPDATE support_requests
         SET status = 'processed', processed_at = NOW()
         WHERE id = :id AND status = 'new'"
    );
    $stmt->execute(['id' => $id]);
    if ($stmt->rowCount() < 1) {
        portal_json(['success' => false, 'message' => 'ID not found or already processed'], 200);
    }
} catch (Throwable $e) {
    portal_json(['success' => false, 'error' => 'Server error'], 500);
}

portal_json(['success' => true, 'message' => 'Status updated']);
