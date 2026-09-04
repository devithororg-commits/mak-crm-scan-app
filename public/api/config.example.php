<?php
/**
 * Copy to config.local.php and set your Hostinger MySQL credentials.
 * config.local.php is gitignored — never commit secrets.
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'u776633649_aurora',
    'db_user' => 'u776633649_aurora',
    'db_pass' => 'CHANGE_ME',
    'api_token' => '', // optional bearer token; empty = open (dev only)
    'cors_origin' => '*',
];
