<?php
// cart_add.php — добавить товар в корзину
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован', 'need_login' => true]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$productId = (int)($input['product_id'] ?? 0);
$quantity = (int)($input['quantity'] ?? 1);

if ($productId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный товар']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

// Проверяем, есть ли товар
$stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
$stmt->execute([$productId]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Товар не найден']);
    exit;
}

// Добавляем или обновляем количество
$stmt = $pdo->prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?');
$stmt->execute([$userId, $productId, $quantity, $quantity]);

echo json_encode(['success' => true]);
?>