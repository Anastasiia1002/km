<?php
// functions.php - Допоміжні функції для форми підтримки

// Константи для валідації
define('MAX_FILE_SIZE', 1048576); // 1MB
define('MAX_FILES_COUNT', 5);
define('MAX_COMPANY_LENGTH', 255);
define('MAX_NAME_LENGTH', 255);
define('MAX_PHONE_LENGTH', 20);
define('MAX_MESSAGE_LENGTH', 5000);
define('RATE_LIMIT_REQUESTS', 5); // Максимум заявок
define('RATE_LIMIT_WINDOW', 3600); // За період (1 година)

// Дозволені MIME-типи файлів
function getAllowedMimeTypes() {
    return [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
}

// Дозволені розширення файлів
function getAllowedExtensions() {
    return ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
}

function portal_ensure_session(): void
{
    if (function_exists('portal_start_session')) {
        portal_start_session();
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

// Генерація CSRF токену
function generateCsrfToken() {
    portal_ensure_session();
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Перевірка CSRF токену
function validateCsrfToken($token) {
    portal_ensure_session();
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Rate limiting - перевірка кількості заявок з IP
function checkRateLimit($pdo, $ip) {
    try {
        // Перевіряємо чи існує колонка ip_address
        $stmt = $pdo->query("SHOW COLUMNS FROM tech_support_requests LIKE 'ip_address'");
        $column_exists = $stmt->rowCount() > 0;

        if ($column_exists) {
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tech_support_requests
                                   WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)");
            $stmt->execute([$ip, RATE_LIMIT_WINDOW]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return ($result['count'] ?? 0) < RATE_LIMIT_REQUESTS;
        } else {
            // Якщо колонка не існує, використовуємо загальну перевірку (без IP)
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tech_support_requests
                                   WHERE created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)");
            $stmt->execute([RATE_LIMIT_WINDOW]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return ($result['count'] ?? 0) < RATE_LIMIT_REQUESTS;
        }
    } catch (Exception $e) {
        // При помилці дозволяємо запит (fail-open)
        error_log("Rate limit check error: " . $e->getMessage());
        return true;
    }
}

// Валідація українського телефону
function normalizeUaPhoneDigits($phone) {
    return preg_replace('/\D+/', '', (string) $phone);
}

function isValidUaPhone($phone) {
    $digits = normalizeUaPhoneDigits($phone);
    return (bool) preg_match('/^0\d{9}$/', $digits) || (bool) preg_match('/^380\d{9}$/', $digits);
}

// Валідація полів форми
function validateFormFields($company, $name, $phone, $message) {
    $errors = [];

    if (empty($company) || mb_strlen($company) > MAX_COMPANY_LENGTH) {
        $errors['company'] = "Поле 'Компанія' обов'язкове та не може перевищувати " . MAX_COMPANY_LENGTH . " символів.";
    }

    if (empty($name) || mb_strlen($name) > MAX_NAME_LENGTH) {
        $errors['name'] = "Поле 'ПІБ' обов'язкове та не може перевищувати " . MAX_NAME_LENGTH . " символів.";
    }

    if (empty($phone) || mb_strlen($phone) > MAX_PHONE_LENGTH) {
        $errors['phone'] = "Поле 'Телефон' обов'язкове та не може перевищувати " . MAX_PHONE_LENGTH . " символів.";
    } elseif (!isValidUaPhone($phone)) {
        $errors['phone'] = "Невірний формат. Вкажіть український номер: +380..., 380... або 0...";
    }

    if (empty($message) || mb_strlen($message) > MAX_MESSAGE_LENGTH) {
        $errors['message'] = "Поле 'Коментар' обов'язкове та не може перевищувати " . MAX_MESSAGE_LENGTH . " символів.";
    }

    return $errors;
}

// Обробка завантаження файлів
function processUploadedFiles($upload_dir, $allowed_mime_types, $allowed_extensions) {
    $uploaded_files = [];
    $errors = [];

    if (empty($_FILES['files']['name'][0])) {
        return ['files' => $uploaded_files, 'errors' => $errors];
    }

    // Перевірка існування папки
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        $errors[] = "Помилка створення папки для завантаження файлів.";
        return ['files' => $uploaded_files, 'errors' => $errors];
    }

    $total_files = count($_FILES['files']['name']);
    if ($total_files > MAX_FILES_COUNT) {
        $errors[] = "Дозволено завантажувати не більше " . MAX_FILES_COUNT . " файлів.";
        return ['files' => $uploaded_files, 'errors' => $errors];
    }

    // Відкриваємо finfo один раз для оптимізації
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $upload_dir_abs = realpath($upload_dir);

    if ($upload_dir_abs === false) {
        $errors[] = "Помилка доступу до папки завантаження.";
        finfo_close($finfo);
        return ['files' => $uploaded_files, 'errors' => $errors];
    }

    foreach ($_FILES['files']['name'] as $key => $filename) {
        // Захист від path traversal
        $filename = basename($filename);
        $tmp_name = $_FILES['files']['tmp_name'][$key];
        $size = $_FILES['files']['size'][$key];
        $error = $_FILES['files']['error'][$key];

        // Перевірка помилки завантаження
        if ($error !== UPLOAD_ERR_OK) {
            $errors[] = "Помилка завантаження файлу $filename.";
            break;
        }

        // Перевірка чи файл дійсно завантажений
        if (!is_uploaded_file($tmp_name)) {
            $errors[] = "Файл $filename не був коректно завантажений.";
            break;
        }

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // Перевірка розміру
        if ($size > MAX_FILE_SIZE) {
            $errors[] = "Файл $filename завеликий (макс 1Мб).";
            break;
        }

        // Перевірка розширення
        if (!in_array($ext, $allowed_extensions)) {
            $errors[] = "Формат файлу $filename недопустимий.";
            break;
        }

        // Перевірка MIME-типу
        $mime_type = finfo_file($finfo, $tmp_name);
        if (!in_array($mime_type, $allowed_mime_types)) {
            $errors[] = "Тип файлу $filename недопустимий.";
            break;
        }

        // Генерація безпечного імені файлу
        $new_name = basename(uniqid('file_', true) . '.' . $ext);
        $new_path = $upload_dir . $new_name;

        // Додаткова перевірка на path traversal
        $new_path_abs = realpath(dirname($new_path));
        if ($new_path_abs === false || strpos($new_path_abs . DIRECTORY_SEPARATOR, $upload_dir_abs . DIRECTORY_SEPARATOR) !== 0) {
            $errors[] = "Невірний шлях для файлу $filename.";
            break;
        }

        // Збереження файлу
        if (move_uploaded_file($tmp_name, $new_path)) {
            $uploaded_files[] = $upload_dir . $new_name;
        } else {
            $errors[] = "Помилка збереження файлу $filename.";
            break;
        }
    }

    finfo_close($finfo);
    return ['files' => $uploaded_files, 'errors' => $errors];
}

// Видалення завантажених файлів
function cleanupUploadedFiles($files) {
    foreach ($files as $file) {
        if (file_exists($file)) {
            @unlink($file);
        }
    }
}

// Отримання IP адреси клієнта
function getClientIp() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Логування дій
function logAction($action, $details = '') {
    $log_file = __DIR__ . '/logs/actions.log';
    $log_dir = dirname($log_file);

    if (!is_dir($log_dir)) {
        @mkdir($log_dir, 0755, true);
    }

    $timestamp = date('Y-m-d H:i:s');
    $ip = getClientIp();
    $log_entry = "[$timestamp] [$ip] $action";
    if ($details) {
        $log_entry .= " - $details";
    }
    $log_entry .= "\n";

    @file_put_contents($log_file, $log_entry, FILE_APPEND);
}

