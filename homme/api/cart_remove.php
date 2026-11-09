<?php
// cart_remove.php — удалить товар из корзины
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$cartId = (int)($input['cart_id'] ?? 0);

if ($cartId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный ID']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
$stmt->execute([$cartId, (int)$_SESSION['user_id']]);

echo json_encode(['success' => true]);
?>