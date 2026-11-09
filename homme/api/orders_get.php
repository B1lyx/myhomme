<?php
// orders_get.php — история заказов пользователя
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

$stmt = $pdo->prepare('
    SELECT o.id, o.total, o.status, o.created_at,
           (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
');
$stmt->execute([$userId]);
$orders = $stmt->fetchAll();

echo json_encode(['success' => true, 'orders' => $orders]);
?>