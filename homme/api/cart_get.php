<?php
// cart_get.php — получить корзину пользователя
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован', 'need_login' => true]);
    exit;
}

$userId = (int)$_SESSION['user_id'];

$stmt = $pdo->prepare('
    SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.badge
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
');
$stmt->execute([$userId]);
$items = $stmt->fetchAll();

$total = 0;
foreach ($items as $item) {
    $total += $item['price'] * $item['quantity'];
}

echo json_encode(['success' => true, 'items' => $items, 'total' => $total, 'count' => count($items)]);
?>