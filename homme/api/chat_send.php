<?php
// chat_send.php — отправка сообщения в чат
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$sessionId = $input['session_id'] ?? '';
$message = trim($input['message'] ?? '');
$sender = $input['sender'] ?? 'user';

if (empty($sessionId) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Пустое сообщение']);
    exit;
}

// Ограничиваем длину
$message = mb_substr($message, 0, 500);

// Сохраняем
$stmt = $pdo->prepare('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)');
$stmt->execute([$sessionId, $sender, $message]);

echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
?>