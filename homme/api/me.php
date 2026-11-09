<?php
// me.php — текущий пользователь
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email']
    ]
]);
?>