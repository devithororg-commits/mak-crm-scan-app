<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$db = pdo($config);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $_GET['id']) : '';
$owner = isset($_GET['owner']) ? substr((string) $_GET['owner'], 0, 64) : 'default';

$body = [];
if (in_array($method, ['POST', 'PUT'], true)) {
    $raw = file_get_contents('php://input') ?: '{}';
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        json_out(400, ['ok' => false, 'error' => 'Invalid JSON body']);
    }
}

try {
    if ($method === 'GET' && $id === '') {
        $stmt = $db->prepare(
            'SELECT id, title, theme_id, slide_count, ast_version, created_at, updated_at
             FROM aurora_decks WHERE owner_key = ? ORDER BY updated_at DESC LIMIT 100'
        );
        $stmt->execute([$owner]);
        json_out(200, ['ok' => true, 'decks' => $stmt->fetchAll()]);
    }

    if ($method === 'GET' && $id !== '') {
        $stmt = $db->prepare('SELECT * FROM aurora_decks WHERE id = ? AND owner_key = ? LIMIT 1');
        $stmt->execute([$id, $owner]);
        $row = $stmt->fetch();
        if (!$row) {
            json_out(404, ['ok' => false, 'error' => 'Deck not found']);
        }
        $row['ast'] = json_decode($row['ast'], true);
        json_out(200, ['ok' => true, 'deck' => $row]);
    }

    if ($method === 'POST') {
        $ast = $body['ast'] ?? null;
        if (!is_array($ast)) {
            json_out(400, ['ok' => false, 'error' => 'Missing ast object']);
        }
        $deckId = $body['id'] ?? bin2hex(random_bytes(8));
        $title = substr((string) ($body['title'] ?? 'Untitled deck'), 0, 255);
        $themeId = substr((string) ($body['theme_id'] ?? ($ast['theme']['id'] ?? 'noir')), 0, 64);
        $slides = $ast['slides'] ?? [];
        $slideCount = is_array($slides) ? count($slides) : 1;
        $astVersion = (int) ($body['ast_version'] ?? ($ast['version'] ?? 1));

        $stmt = $db->prepare(
            'INSERT INTO aurora_decks (id, owner_key, title, ast, ast_version, theme_id, slide_count)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               title = VALUES(title),
               ast = VALUES(ast),
               ast_version = VALUES(ast_version),
               theme_id = VALUES(theme_id),
               slide_count = VALUES(slide_count),
               updated_at = CURRENT_TIMESTAMP'
        );
        $stmt->execute([
            $deckId,
            $owner,
            $title,
            json_encode($ast, JSON_UNESCAPED_UNICODE),
            $astVersion,
            $themeId,
            $slideCount,
        ]);

        $ver = $db->prepare('INSERT INTO aurora_deck_versions (deck_id, ast) VALUES (?, ?)');
        $ver->execute([$deckId, json_encode($ast, JSON_UNESCAPED_UNICODE)]);

        json_out(201, ['ok' => true, 'id' => $deckId]);
    }

    if ($method === 'PUT' && $id !== '') {
        $ast = $body['ast'] ?? null;
        if (!is_array($ast)) {
            json_out(400, ['ok' => false, 'error' => 'Missing ast object']);
        }
        $title = substr((string) ($body['title'] ?? 'Untitled deck'), 0, 255);
        $themeId = substr((string) ($body['theme_id'] ?? ($ast['theme']['id'] ?? 'noir')), 0, 64);
        $slides = $ast['slides'] ?? [];
        $slideCount = is_array($slides) ? count($slides) : 1;
        $astVersion = (int) ($body['ast_version'] ?? ($ast['version'] ?? 1));

        $stmt = $db->prepare(
            'UPDATE aurora_decks SET title = ?, ast = ?, ast_version = ?, theme_id = ?, slide_count = ?
             WHERE id = ? AND owner_key = ?'
        );
        $stmt->execute([
            $title,
            json_encode($ast, JSON_UNESCAPED_UNICODE),
            $astVersion,
            $themeId,
            $slideCount,
            $id,
            $owner,
        ]);
        if ($stmt->rowCount() === 0) {
            json_out(404, ['ok' => false, 'error' => 'Deck not found']);
        }

        $ver = $db->prepare('INSERT INTO aurora_deck_versions (deck_id, ast) VALUES (?, ?)');
        $ver->execute([$id, json_encode($ast, JSON_UNESCAPED_UNICODE)]);

        json_out(200, ['ok' => true, 'id' => $id]);
    }

    if ($method === 'DELETE' && $id !== '') {
        $stmt = $db->prepare('DELETE FROM aurora_decks WHERE id = ? AND owner_key = ?');
        $stmt->execute([$id, $owner]);
        json_out(200, ['ok' => true, 'deleted' => $stmt->rowCount() > 0]);
    }

    json_out(405, ['ok' => false, 'error' => 'Method not allowed']);
} catch (Throwable $e) {
    json_out(500, ['ok' => false, 'error' => 'Server error']);
}
