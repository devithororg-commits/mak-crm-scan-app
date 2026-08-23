<?php
declare(strict_types=1);
require_once __DIR__ . '/../lib.php';

handle_api_options();
cors_headers();

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        throw new ApiException('Method not allowed', 405);
    }
    $body = read_json_body();
    $result = verify_login_otp(
        (string) ($body['email'] ?? ''),
        (string) ($body['otp'] ?? ''),
        studio_config(),
    );
    json_response($result);
} catch (ApiException $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], $e->statusCode);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'Verification failed'], 500);
}
