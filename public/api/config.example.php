<?php
/**
 * Copy to config.local.php and paste your keys (never commit config.local.php).
 */
return [
    'openai_api_key' => '',
    'tavily_api_key' => '',
    'unsplash_access_key' => '',

    'allowed_domain' => 'devithor.in',
    'allowed_emails' => [],

    'session_secret' => 'change-this-to-a-long-random-string',
    'otp_ttl_minutes' => 10,
    'otp_resend_cooldown' => 60,
    'mock_otp' => true,

    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_encryption' => 'ssl',
    'smtp_user' => '',
    'smtp_pass' => '',
    'smtp_from' => 'Creative Studio <noreply@apptesting.in>',
];
