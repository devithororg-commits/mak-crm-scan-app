<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';

handle_api_options();
cors_headers();

$config = studio_config();
$email = verify_session_token(null, $config);
if (!$email) {
    json_response(['ok' => false, 'error' => 'Login required to open Settings.'], 401);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        json_response([
            'ok' => true,
            'keysReady' => studio_keys_ready($config),
            'settings' => studio_settings_public($config),
        ]);
    }

    if ($method === 'POST') {
        $result = update_studio_settings(read_json_body(), $config);
        json_response($result);
    }

    throw new ApiException('Method not allowed', 405);
} catch (ApiException $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], $e->statusCode);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'Could not save settings: ' . $e->getMessage()], 500);
}
