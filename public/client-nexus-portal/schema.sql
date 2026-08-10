-- Optional schema for Online-кабінет support requests.
-- process.php / API will also CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS support_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  message TEXT NOT NULL,
  files_links JSON NULL,
  status ENUM('new','processed') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  ip VARCHAR(64) NULL,
  INDEX idx_status_created (status, created_at),
  INDEX idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
