<?php
declare(strict_types=1);
require_once __DIR__ . '/../lib.php';

handle_api_options();
cors_headers();

$config = studio_config();
$email = verify_session_token(null, $config);
if (!$email) {
    json_response(['ok' => false, 'error' => 'Session expired. Login again.'], 401);
}

json_response(['ok' => true, 'email' => $email]);
