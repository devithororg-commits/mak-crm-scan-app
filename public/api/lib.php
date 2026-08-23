<?php
declare(strict_types=1);

require_once __DIR__ . '/template-ids.php';
require_once __DIR__ . '/smartfill_lib.php';
require_once __DIR__ . '/smtp.php';

final class ApiException extends Exception
{
    public function __construct(string $message, public int $statusCode = 400)
    {
        parent::__construct($message);
    }
}

function studio_config_invalidate(): void
{
    $GLOBALS['studio_config_cache'] = null;
}

function studio_config(): array
{
    if (($GLOBALS['studio_config_cache'] ?? null) !== null) {
        return $GLOBALS['studio_config_cache'];
    }

    $defaults = [
        'openai_api_key' => '',
        'tavily_api_key' => '',
        'unsplash_access_key' => '',
        'allowed_domain' => '',
        'allowed_emails' => [],
        'session_secret' => 'change-me',
        'otp_ttl_minutes' => 10,
        'otp_resend_cooldown' => 60,
        'mock_otp' => false,
        'smtp_host' => '',
        'smtp_port' => 465,
        'smtp_encryption' => 'ssl',
        'smtp_user' => '',
        'smtp_pass' => '',
        'smtp_from' => 'Creative Studio <noreply@apptesting.in>',
    ];

    $config = $defaults;
    foreach (['config.php', 'config.local.php'] as $file) {
        $path = __DIR__ . '/' . $file;
        if (!is_file($path)) {
            continue;
        }
        $loaded = include $path;
        if (is_array($loaded)) {
            $config = array_merge($config, $loaded);
        }
    }

    if (!empty($config['allowed_emails']) && is_array($config['allowed_emails'])) {
        $config['allowed_emails'] = array_values(array_unique(array_map(
            fn ($e) => strtolower(trim((string) $e)),
            $config['allowed_emails'],
        )));
    } else {
        $config['allowed_emails'] = [];
    }

    $config['allowed_domain'] = strtolower(trim(str_replace('@', '', (string) $config['allowed_domain'])));
    migrate_studio_secrets_from_config($config);
    foreach (read_studio_secrets() as $secretKey => $secretValue) {
        if ($secretValue !== '') {
            $config[$secretKey] = $secretValue;
        }
    }

    $GLOBALS['studio_config_cache'] = $config;
    return $config;
}

function studio_secret_keys(): array
{
    return ['openai_api_key', 'tavily_api_key', 'unsplash_access_key'];
}

function read_studio_secrets(): array
{
    $data = read_store('studio-secrets.json');
    $out = [];
    foreach (studio_secret_keys() as $key) {
        $out[$key] = trim((string) ($data[$key] ?? ''));
    }
    return $out;
}

function migrate_studio_secrets_from_config(array $config): void
{
    $existing = read_store('studio-secrets.json');
    if ($existing !== []) {
        return;
    }

    $seed = [];
    foreach (studio_secret_keys() as $key) {
        $value = trim((string) ($config[$key] ?? ''));
        if ($value !== '') {
            $seed[$key] = $value;
        }
    }

    if ($seed !== []) {
        write_store('studio-secrets.json', $seed);
    }
}

function write_studio_secrets(array $secrets): void
{
    $path = data_path('studio-secrets.json');
    $payload = json_encode($secrets, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        throw new ApiException('Could not encode settings.', 500);
    }
    $written = @file_put_contents($path, $payload . "\n", LOCK_EX);
    if ($written === false) {
        throw new ApiException('Could not save settings. Server data folder is not writable.', 500);
    }
    @chmod($path, 0640);
    studio_config_invalidate();
}

function mask_secret(string $value): array
{
    $value = trim($value);
    if ($value === '') {
        return ['set' => false, 'hint' => ''];
    }
    $len = strlen($value);
    if ($len <= 4) {
        return ['set' => true, 'hint' => str_repeat('•', $len)];
    }
    return ['set' => true, 'hint' => '…' . substr($value, -4)];
}

function studio_settings_public(array $config): array
{
    return [
        'openaiApiKey' => mask_secret((string) ($config['openai_api_key'] ?? '')),
        'tavilyApiKey' => mask_secret((string) ($config['tavily_api_key'] ?? '')),
        'unsplashAccessKey' => mask_secret((string) ($config['unsplash_access_key'] ?? '')),
    ];
}

function studio_keys_ready(array $config): bool
{
    return ($config['openai_api_key'] ?? '') !== '' && ($config['tavily_api_key'] ?? '') !== '';
}

function write_studio_config_file(array $config): void
{
    // Legacy helper — API keys are stored in api/data/studio-secrets.json instead.
    $secrets = [];
    foreach (studio_secret_keys() as $key) {
        $value = trim((string) ($config[$key] ?? ''));
        if ($value !== '') {
            $secrets[$key] = $value;
        }
    }
    write_studio_secrets(array_merge(read_studio_secrets(), $secrets));
}

function update_studio_settings(array $body, array $config): array
{
    $map = [
        'openaiApiKey' => 'openai_api_key',
        'tavilyApiKey' => 'tavily_api_key',
        'unsplashAccessKey' => 'unsplash_access_key',
    ];

    $secrets = read_studio_secrets();
    $changed = false;
    foreach ($map as $inputKey => $configKey) {
        if (!array_key_exists($inputKey, $body)) {
            continue;
        }
        $value = trim((string) $body[$inputKey]);
        if ($value === '') {
            continue;
        }
        $secrets[$configKey] = $value;
        $changed = true;
    }

    if (!$changed) {
        throw new ApiException('Paste at least one API key to save.');
    }

    write_studio_secrets($secrets);
    $fresh = studio_config();

    return [
        'ok' => true,
        'message' => 'API keys saved successfully.',
        'keysReady' => studio_keys_ready($fresh),
        'settings' => studio_settings_public($fresh),
    ];
}

function cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($origin !== '' && parse_url($origin, PHP_URL_HOST) === $host) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } elseif ($host !== '') {
        header('Access-Control-Allow-Origin: https://' . $host);
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function data_path(string $file): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir . '/' . $file;
}

function read_store(string $file): array
{
    $path = data_path($file);
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function write_store(string $file, array $data): void
{
    file_put_contents(data_path($file), json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

function email_allowed(string $email, array $config): bool
{
    $email = strtolower(trim($email));
    if (in_array($email, $config['allowed_emails'], true)) {
        return true;
    }
    if ($config['allowed_domain'] !== '') {
        $parts = explode('@', $email);
        $domain = $parts[1] ?? '';
        $allowedDomains = array_map(
            fn ($d) => strtolower(trim(str_replace('@', '', $d))),
            explode(',', $config['allowed_domain']),
        );
        if (in_array($domain, $allowedDomains, true)) {
            return true;
        }
    }
    return false;
}

function token_hash(string $token, string $secret): string
{
    return substr(hash_hmac('sha256', $token, $secret), 0, 32);
}

function request_auth_header(): ?string
{
    $candidates = [
        $_SERVER['HTTP_AUTHORIZATION'] ?? null,
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
    ];

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            foreach ($headers as $name => $value) {
                if (strcasecmp((string) $name, 'Authorization') === 0) {
                    $candidates[] = $value;
                }
            }
        }
    }

    foreach ($candidates as $header) {
        $header = trim((string) $header);
        if ($header !== '') {
            return $header;
        }
    }

    return null;
}

function verify_session_token(?string $authHeader, array $config): ?string
{
    $authHeader = $authHeader ?: request_auth_header();
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }
    $token = trim(substr($authHeader, 7));
    if ($token === '') {
        return null;
    }
    $hash = token_hash($token, (string) $config['session_secret']);
    $sessions = read_store('sessions.json');
    $session = $sessions[$hash] ?? null;
    if (!$session || ($session['expiresAt'] ?? 0) < time()) {
        return null;
    }
    return (string) ($session['email'] ?? '');
}

function send_otp_email(string $email, string $otp, array $config): void
{
    send_studio_otp_email($email, $otp, $config);
}

function issue_login_otp(string $email, array $config): array
{
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new ApiException('Enter a valid company email');
    }
    if (!email_allowed($email, $config)) {
        throw new ApiException('This email is not authorized. Contact admin to allow your email.', 403);
    }

    $store = read_store('otp.json');
    $now = time();
    $existing = $store[$email] ?? null;
    $cooldown = (int) $config['otp_resend_cooldown'];
    if ($existing && ($now - (int) ($existing['lastSentAt'] ?? 0)) < $cooldown) {
        $retry = $cooldown - ($now - (int) $existing['lastSentAt']);
        throw new ApiException("Please wait {$retry}s before requesting another OTP.", 429);
    }

    $otp = (string) random_int(100000, 999999);
    $store[$email] = [
        'otp' => $otp,
        'expiresAt' => $now + ((int) $config['otp_ttl_minutes'] * 60),
        'lastSentAt' => $now,
    ];
    write_store('otp.json', $store);
    send_studio_otp_email($email, $otp, $config);

    $result = [
        'ok' => true,
        'message' => !empty($config['mock_otp']) ? 'OTP generated (mock mode).' : 'OTP sent to your email.',
        'mock' => (bool) $config['mock_otp'],
    ];
    if (!empty($config['mock_otp'])) {
        $result['debugOtp'] = $otp;
    }
    return $result;
}

function verify_login_otp(string $email, string $otp, array $config): array
{
    $email = strtolower(trim($email));
    $otp = trim($otp);
    if (!email_allowed($email, $config)) {
        throw new ApiException('This email is not authorized.', 403);
    }

    $store = read_store('otp.json');
    $record = $store[$email] ?? null;
    if (!$record) {
        throw new ApiException('No OTP found. Request a new code.');
    }
    if (time() > (int) ($record['expiresAt'] ?? 0)) {
        unset($store[$email]);
        write_store('otp.json', $store);
        throw new ApiException('OTP expired. Request a new code.');
    }
    if (($record['otp'] ?? '') !== $otp) {
        throw new ApiException('Invalid OTP.');
    }

    unset($store[$email]);
    write_store('otp.json', $store);

    $token = bin2hex(random_bytes(24));
    $hash = token_hash($token, (string) $config['session_secret']);
    $sessions = read_store('sessions.json');
    $sessions[$hash] = [
        'email' => $email,
        'expiresAt' => time() + 86400,
    ];
    write_store('sessions.json', $sessions);

    return ['ok' => true, 'token' => $token, 'email' => $email, 'expiresInHours' => 24];
}

function logout_session(?string $authHeader, array $config): void
{
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return;
    }
    $token = trim(substr($authHeader, 7));
    if ($token === '') {
        return;
    }
    $hash = token_hash($token, (string) $config['session_secret']);
    $sessions = read_store('sessions.json');
    unset($sessions[$hash]);
    write_store('sessions.json', $sessions);
}

function handle_api_options(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        cors_headers();
        http_response_code(204);
        exit;
    }
}

function http_post_json(string $url, array $payload, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 60,
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false) {
        throw new ApiException('Upstream request failed', 502);
    }
    $data = json_decode($body, true);
    if ($code >= 400) {
        $msg = is_array($data) ? ($data['error']['message'] ?? $data['error'] ?? $body) : $body;
        throw new ApiException(is_string($msg) ? $msg : 'Upstream error', $code >= 500 ? 502 : 400);
    }
    return is_array($data) ? $data : [];
}

function http_get_json(string $url, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 60,
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $code >= 400) {
        return [];
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}
