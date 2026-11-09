<?php
// order_create.php — оформить заказ из корзины
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

$userId = (int)$_SESSION['user_id'];

// Получаем корзину
$stmt = $pdo->prepare('
    SELECT c.quantity, p.id as product_id, p.name, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
');
$stmt->execute([$userId]);
$items = $stmt->fetchAll();

if (empty($items)) {
    http_response_code(400);
    echo json_encode(['error' => 'Корзина пуста']);
    exit;
}

$total = 0;
foreach ($items as $item) {
    $total += $item['price'] * $item['quantity'];
}

// Создаём заказ
$stmt = $pdo->prepare('INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)');
$itemsJson = json_encode($items);
$stmt->execute([$userId, $itemsJson, $total]);
$orderId = (int)$pdo->lastInsertId();

// Сохраняем позиции заказа
foreach ($items as $item) {
    $stmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$orderId, $item['product_id'], $item['name'], $item['price'], $item['quantity']]);
}

// Очищаем корзину
$stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);

echo json_encode(['success' => true, 'order_id' => $orderId, 'total' => $total]);
?>