<?php
// config.example.php — скопіюйте як config.local.php на сервері (не комітьте секрети).

declare(strict_types=1);

return [
    'db_host' => 'localhost',
    'db_name' => 'admin_support_requests',
    'db_user' => 'admin_requests',
    'db_pass' => 'CHANGE_ME',
    'api_secret_key' => 'CHANGE_ME',
    'base_url' => 'https://km-trade.net/client-nexus-portal/',
    'rate_limit_per_hour' => 5,
    'max_file_size' => 1048576,
    'max_files' => 5,
    'max_message_length' => 5000,
];
