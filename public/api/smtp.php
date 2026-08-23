<?php
declare(strict_types=1);

function encode_mail_header(string $value): string
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function smtp_write_payload($socket, string $payload): void
{
    $normalized = str_replace(["\r\n", "\r"], "\n", $payload);
    foreach (explode("\n", $normalized) as $line) {
        if ($line !== '' && $line[0] === '.') {
            $line = '.' . $line;
        }
        fwrite($socket, $line . "\r\n");
    }
    fwrite($socket, ".\r\n");
}

function studio_smtp_send(
    string $host,
    int $port,
    string $encryption,
    string $user,
    string $password,
    string $fromEmail,
    string $fromName,
    string $to,
    string $subject,
    string $body,
): void {
    $encryption = strtolower($encryption);
    $remote = $encryption === 'ssl'
        ? "ssl://{$host}:{$port}"
        : "tcp://{$host}:{$port}";

    $socket = @stream_socket_client($remote, $errno, $errstr, 25);
    if (!$socket) {
        throw new ApiException('Could not connect to mail server.', 503);
    }

    stream_set_timeout($socket, 25);
    $read = fn () => fgets($socket, 512) ?: '';
    $write = fn (string $msg) => fwrite($socket, $msg . "\r\n");

    $expect = function (array $codes) use ($read): void {
        $line = $read();
        $code = (int) substr($line, 0, 3);
        if (!in_array($code, $codes, true)) {
            throw new ApiException('Mail server error while sending OTP.', 503);
        }
    };

    $expect([220]);
    $write('EHLO apptesting.in');
    $expect([250]);

    if ($encryption === 'tls') {
        $write('STARTTLS');
        $expect([220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new ApiException('Could not secure mail connection.', 503);
        }
        $write('EHLO apptesting.in');
        $expect([250]);
    }

    $write('AUTH LOGIN');
    $expect([334]);
    $write(base64_encode($user));
    $expect([334]);
    $write(base64_encode($password));
    $expect([235]);

    $write('MAIL FROM:<' . $fromEmail . '>');
    $expect([250]);
    $write('RCPT TO:<' . $to . '>');
    $expect([250, 251]);
    $write('DATA');
    $expect([354]);

    $headers = [
        'From: ' . encode_mail_header($fromName) . " <{$fromEmail}>",
        'To: <' . $to . '>',
        'Subject: ' . encode_mail_header($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    smtp_write_payload($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body);
    $expect([250]);
    $write('QUIT');
    fclose($socket);
}

function parse_from_header(string $from): array
{
    if (preg_match('/^(.+)<([^>]+)>$/', trim($from), $m)) {
        return [trim($m[1]), trim($m[2])];
    }
    return ['Creative Studio', trim($from)];
}

function send_studio_otp_email(string $to, string $otp, array $config): void
{
    if (!empty($config['mock_otp'])) {
        return;
    }

    $pass = trim((string) ($config['smtp_pass'] ?? ''));
    if ($pass === '' || empty($config['smtp_host']) || empty($config['smtp_user'])) {
        throw new ApiException('SMTP not configured. Set smtp settings in api/config.local.php', 503);
    }

    [$fromName, $fromEmail] = parse_from_header((string) ($config['smtp_from'] ?? $config['smtp_user']));
    $ttl = (int) ($config['otp_ttl_minutes'] ?? 10);
    $subject = 'Creative Studio — Login OTP';
    $body = "Your login code is {$otp}. Valid for {$ttl} minutes.\n\nIf you did not request this, ignore this email.";

    studio_smtp_send(
        (string) $config['smtp_host'],
        (int) ($config['smtp_port'] ?? 465),
        (string) ($config['smtp_encryption'] ?? 'ssl'),
        (string) $config['smtp_user'],
        $pass,
        $fromEmail ?: (string) $config['smtp_user'],
        $fromName,
        $to,
        $subject,
        $body,
    );
}
