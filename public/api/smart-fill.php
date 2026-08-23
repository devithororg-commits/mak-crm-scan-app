<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';

handle_api_options();
cors_headers();

$config = studio_config();
$email = verify_session_token($_SERVER['HTTP_AUTHORIZATION'] ?? null, $config);
if (!$email) {
    json_response(['error' => 'Login required. Verify company email OTP first.'], 401);
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        throw new ApiException('Method not allowed', 405);
    }
    $result = run_smart_fill($config, read_json_body());
    json_response($result);
} catch (ApiException $e) {
    json_response(['error' => $e->getMessage()], $e->statusCode);
} catch (Throwable $e) {
    json_response(['error' => 'Smart fill failed'], 500);
}
