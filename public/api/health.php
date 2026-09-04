<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

json_out(200, [
    'ok' => true,
    'service' => 'Aurora Studio API',
    'version' => '1.0.0',
    'time' => gmdate('c'),
]);
