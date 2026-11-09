<?php
// chat_get.php — получение сообщений чата
require_once 'config.php';

$sessionId = $_GET['session_id'] ?? '';
$lastId = (int)($_GET['last_id'] ?? 0);

if (empty($sessionId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Нет session_id']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = ? AND id > ? ORDER BY id ASC');
$stmt->execute([$sessionId, $lastId]);
$messages = $stmt->fetchAll();

echo json_encode(['success' => true, 'messages' => $messages]);
?>