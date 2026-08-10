<?php
// index.php
require_once 'config.php';
require_once 'functions.php';

// Забороняємо індексацію сторінки на рівні HTTP-заголовка
header('X-Robots-Tag: noindex, nofollow', true);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://km-trade.net',
    'https://www.km-trade.net',
    'https://anastasiia1002.github.io',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
];
$corsOrigin = ($origin && in_array($origin, $allowedOrigins, true)) ? $origin : '';
if ($corsOrigin) {
    header('Access-Control-Allow-Origin: ' . $corsOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
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

// Запускаємо сесію для CSRF токену
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$message_sent = false;
$error_msg = '';
$field_errors = [];
$request_id = null;
$form_data = [
        'company' => '',
        'name' => '',
        'phone' => '',
        'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Перевірка CSRF токену
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!validateCsrfToken($csrf_token)) {
        $error_msg = "Помилка безпеки. Будь ласка, оновіть сторінку та спробуйте ще раз.";
        if (portal_wants_json()) {
            portal_json_response(['success' => false, 'error' => $error_msg], 403);
        }
    } else {
        // Rate limiting
        $client_ip = getClientIp();
        if (!checkRateLimit($pdo, $client_ip)) {
            $error_msg = "Перевищено ліміт заявок. Будь ласка, спробуйте пізніше.";
            if (portal_wants_json()) {
                portal_json_response(['success' => false, 'error' => $error_msg], 429);
            }
        } else {
            // Отримання та очищення даних
            $company = trim($_POST['company'] ?? '');
            $name = trim($_POST['name'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $message = trim($_POST['message'] ?? '');

            // Зберігаємо дані для відображення при помилці
            $form_data = [
                    'company' => htmlspecialchars($company, ENT_QUOTES, 'UTF-8'),
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'phone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
                    'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
            ];

            // Валідація полів форми
            $field_errors = validateFormFields($company, $name, $phone, $message);

            if (!empty($field_errors)) {
                $error_msg = "Будь ласка, виправте помилки у формі.";
                if (portal_wants_json()) {
                    portal_json_response([
                        'success' => false,
                        'error' => $error_msg,
                        'fields' => $field_errors,
                    ], 400);
                }
            } else {
                // Обробка файлів
                $upload_dir = 'uploads/';
                $allowed_mime_types = getAllowedMimeTypes();
                $allowed_extensions = getAllowedExtensions();

                $upload_result = processUploadedFiles($upload_dir, $allowed_mime_types, $allowed_extensions);
                $uploaded_files = $upload_result['files'];

                if (!empty($upload_result['errors'])) {
                    $error_msg = implode(' ', $upload_result['errors']);
                    cleanupUploadedFiles($uploaded_files);
                    if (portal_wants_json()) {
                        portal_json_response(['success' => false, 'error' => $error_msg], 400);
                    }
                } else {
                    // Запис у БД
                    try {
                        // Перевіряємо чи існує колонка ip_address
                        $check_stmt = $pdo->query("SHOW COLUMNS FROM tech_support_requests LIKE 'ip_address'");
                        $has_ip_column = $check_stmt->rowCount() > 0;

                        if ($has_ip_column) {
                            $stmt = $pdo->prepare("INSERT INTO tech_support_requests (company, full_name, phone, message, files_links, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
                            $stmt->execute([
                                $company,
                                $name,
                                $phone,
                                $message,
                                json_encode($uploaded_files),
                                $client_ip
                            ]);
                        } else {
                            // Якщо колонка не існує, вставляємо без IP
                            $stmt = $pdo->prepare("INSERT INTO tech_support_requests (company, full_name, phone, message, files_links) VALUES (?, ?, ?, ?, ?)");
                            $stmt->execute([
                                $company,
                                $name,
                                $phone,
                                $message,
                                json_encode($uploaded_files)
                            ]);
                        }

                        $request_id = $pdo->lastInsertId();
                        $message_sent = true;

                        // Логування успішної заявки
                        logAction('NEW_REQUEST', "Request ID: $request_id, Phone: $phone");

                        if (portal_wants_json()) {
                            portal_json_response([
                                'success' => true,
                                'message' => 'Ваша заявка успішно надіслана.',
                                'id' => (int) $request_id,
                            ]);
                        }

                    } catch (Exception $e) {
                        // Видаляємо завантажені файли при помилці збереження
                        cleanupUploadedFiles($uploaded_files);
                        // Не показуємо деталі помилки БД користувачу
                        $error_msg = "Помилка збереження заявки. Спробуйте пізніше або зв'яжіться з підтримкою.";
                        // Логування помилки (для розробників)
                        error_log("Database error in support form: " . $e->getMessage());
                        logAction('ERROR', "Database error: " . $e->getMessage());
                        if (portal_wants_json()) {
                            portal_json_response(['success' => false, 'error' => $error_msg], 500);
                        }
                    }
                }
            }
        }
    }
}

// Генерація CSRF токену для форми
$csrf_token = generateCsrfToken();

$embed = isset($_GET['embed']) && $_GET['embed'] === '1';
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Технічна підтримка | КМ Трейд</title>
    <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
    <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="stylesheet" href="./styles.css?v=km-brand-1">
</head>
<body class="<?= $embed ? 'is-embed' : '' ?>">

<?php if (!$embed): ?>
<header class="portal-header">
    <a class="portal-brand" href="https://km-trade.net/" aria-label="КМ Трейд — на головну">
        <img src="/assets/logo-on-dark.png" alt="КМ Трейд" width="180" height="48" />
    </a>
</header>
<?php endif; ?>

<div class="main-wrapper">
    <div class="form-container">
        <p class="portal-kicker">Техпідтримка КМ Трейд</p>
        <h1>Заявка на технічну підтримку</h1>

        <?php if ($message_sent): ?>
            <div class="alert success" role="alert">
                <h3>Дякуємо!</h3>
                <p>Ваша заявка успішно надіслана.</p>
                <?php if ($request_id): ?>
                    <p><strong>Номер заявки: #<?= htmlspecialchars((string) $request_id) ?></strong></p>
                <?php endif; ?>
                <a href="index.php<?= $embed ? '?embed=1' : '' ?>" class="btn">Надіслати ще одну</a>
            </div>
        <?php else: ?>

            <?php if ($error_msg): ?>
                <div class="alert error" role="alert" aria-live="polite">
                    <strong>Помилка:</strong> <?= htmlspecialchars($error_msg) ?>
                </div>
            <?php endif; ?>

            <div class="info-banner" role="note" aria-label="Інформація для клієнтів">
                Шановний клієнт! Заповніть форму або зателефонуйте за номером <a href="tel:+380503747476">+38&nbsp;(050)&nbsp;374-74-76</a>
                для реєстрації вашого звернення.
            </div>

            <form action="<?= $embed ? 'index.php?embed=1' : '' ?>" method="POST" enctype="multipart/form-data" id="supportForm" novalidate>
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">

                <div class="form-group">
                    <label for="company">Компанія *</label>
                    <input
                            type="text"
                            name="company"
                            id="company"
                            value="<?= $form_data['company'] ?>"
                            required
                            placeholder="KM-Trade"
                            maxlength="<?= MAX_COMPANY_LENGTH ?>"
                            aria-required="true"
                            aria-invalid="<?= isset($field_errors['company']) ? 'true' : 'false' ?>"
                            <?= isset($field_errors['company']) ? 'class="error-field"' : '' ?>
                    >
                    <?php if (isset($field_errors['company'])): ?>
                        <span class="field-error" role="alert"
                              aria-live="polite"><?= htmlspecialchars($field_errors['company']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="name">ПІБ контактної особи *</label>
                    <input
                            type="text"
                            name="name"
                            id="name"
                            value="<?= $form_data['name'] ?>"
                            required
                            placeholder="Шевченко Тарас"
                            maxlength="<?= MAX_NAME_LENGTH ?>"
                            aria-required="true"
                            aria-invalid="<?= isset($field_errors['name']) ? 'true' : 'false' ?>"
                            <?= isset($field_errors['name']) ? 'class="error-field"' : '' ?>
                    >
                    <?php if (isset($field_errors['name'])): ?>
                        <span class="field-error" role="alert"
                              aria-live="polite"><?= htmlspecialchars($field_errors['name']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="phone">Телефон *</label>
                    <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value="<?= $form_data['phone'] ?>"
                            required
                            placeholder="+380..."
                            maxlength="<?= MAX_PHONE_LENGTH ?>"
                            aria-required="true"
                            aria-invalid="<?= isset($field_errors['phone']) ? 'true' : 'false' ?>"
                            <?= isset($field_errors['phone']) ? 'class="error-field"' : '' ?>
                    >
                    <?php if (isset($field_errors['phone'])): ?>
                        <span class="field-error" role="alert"
                              aria-live="polite"><?= htmlspecialchars($field_errors['phone']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="message">Коментар *</label>
                    <textarea
                            name="message"
                            id="message"
                            rows="6"
                            required
                            placeholder="Опишіть деталі ситуації..."
                            maxlength="<?= MAX_MESSAGE_LENGTH ?>"
                            aria-required="true"
                            aria-invalid="<?= isset($field_errors['message']) ? 'true' : 'false' ?>"
                            aria-describedby="message-counter"
                        <?= isset($field_errors['message']) ? 'class="error-field"' : '' ?>
                    ><?= $form_data['message'] ?></textarea>
                    <div class="char-counter" id="message-counter"><span id="message-count">0</span> / <?= MAX_MESSAGE_LENGTH ?></div>
                    <?php if (isset($field_errors['message'])): ?>
                        <span class="field-error" role="alert"
                              aria-live="polite"><?= htmlspecialchars($field_errors['message']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group file-upload-area">
                    <label for="fileInput">Прикріпити файли (до <?= MAX_FILES_COUNT ?> шт, макс 1МБ кожен)</label>
                    <input
                            type="file"
                            name="files[]"
                            id="fileInput"
                            multiple
                            accept=".jpg,.png,.jpeg,.pdf,.doc,.docx"
                            aria-describedby="file-help"
                    >
                    <div id="file-help" class="file-help-text">Оберіть файли для завантаження</div>
                    <div id="fileList" class="file-list" role="list" aria-live="polite"></div>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn">
                    <span class="btn-text">Відправити</span>
                    <span class="btn-loader" style="display: none;">Відправка…</span>
                </button>
            </form>
        <?php endif; ?>
    </div>
</div>

<?php if (!$embed): ?>
<footer class="portal-footer">
    <p>&copy; <?php echo date('Y'); ?> КМ Трейд. Усі права захищено.</p>
</footer>
<?php endif; ?>

<script src="script.js"></script>
</body>
</html>
