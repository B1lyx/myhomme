<?php
// chat_sessions.php — список активных чатов (для админки)
require_once 'config.php';

$stmt = $pdo->query("
    SELECT session_id, 
           (SELECT message FROM chat_messages WHERE session_id = c.session_id ORDER BY id DESC LIMIT 1) as last_message,
           (SELECT created_at FROM chat_messages WHERE session_id = c.session_id ORDER BY id DESC LIMIT 1) as last_time,
           COUNT(*) as msg_count
    FROM chat_messages c
    GROUP BY session_id
    ORDER BY last_time DESC
    LIMIT 50
");
$sessions = $stmt->fetchAll();

echo json_encode(['success' => true, 'sessions' => $sessions]);
?>