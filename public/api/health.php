<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';

handle_api_options();
cors_headers();

$config = studio_config();
json_response([
    'ok' => true,
    'service' => 'creative-studio',
    'auth' => $config['allowed_domain'] !== '' || count($config['allowed_emails']) > 0,
    'keys' => $config['openai_api_key'] !== '' && $config['tavily_api_key'] !== '',
]);
