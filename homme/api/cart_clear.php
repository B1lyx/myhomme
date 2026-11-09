<?php
// cart_clear.php — очистить корзину
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
$stmt->execute([(int)$_SESSION['user_id']]);

echo json_encode(['success' => true]);
?>