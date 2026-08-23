<?php
declare(strict_types=1);
require_once __DIR__ . '/../lib.php';

handle_api_options();
cors_headers();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    logout_session($_SERVER['HTTP_AUTHORIZATION'] ?? null, studio_config());
}
json_response(['ok' => true]);
