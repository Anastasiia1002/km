<?php
// api/update_status.php
header('Content-Type: application/json');
require_once 'auth.php';

// Отримуємо дані (підтримує JSON body або POST params)
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? $_POST['id'] ?? 0;
$status = $input['status'] ?? $_POST['status'] ?? '';

// Валідація ID (має бути позитивним цілим числом)
$id = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

if (!$id || $status !== 'processed') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ID or invalid status']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE tech_support_requests SET status = 'processed', processed_at = NOW() WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Status updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID not found or already processed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    // Не показуємо деталі помилки БД
    echo json_encode([
        'success' => false,
        'error' => 'Помилка оновлення статусу. Зверніться до адміністратора.'
    ], JSON_UNESCAPED_UNICODE);
    // Логування для розробників
    error_log("API update_status error: " . $e->getMessage());
}
?>
