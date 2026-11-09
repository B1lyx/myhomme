<?php
// products.php — API для товаров (GET/POST/PUT/DELETE)
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Получить список товаров
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = 'SELECT * FROM products';
    $params = [];
    $conditions = [];
    
    if ($category) {
        $conditions[] = 'category = ?';
        $params[] = $category;
    }
    if ($search) {
        $conditions[] = 'name LIKE ?';
        $params[] = '%' . $search . '%';
    }
    if ($conditions) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }
    $sql .= ' ORDER BY created_at DESC';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

if ($method === 'POST') {
    // Добавить товар (только для админа — упрощённо)
    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');
    $category = trim($input['category'] ?? '');
    $price = (int)($input['price'] ?? 0);
    $old_price = isset($input['old_price']) ? (int)$input['old_price'] : null;
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? '');
    $badge = trim($input['badge'] ?? '');
    $stock = (int)($input['stock'] ?? 0);
    
    if (empty($name) || empty($category) || $price <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Заполните название, категорию и цену']);
        exit;
    }
    
    $stmt = $pdo->prepare('INSERT INTO products (name, category, price, old_price, description, image, badge, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$name, $category, $price, $old_price, $description, $image, $badge ?: null, $stock]);
    
    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    // Обновить товар
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный ID']);
        exit;
    }
    
    $fields = [];
    $params = [];
    foreach (['name', 'category', 'price', 'old_price', 'description', 'image', 'badge', 'stock'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Нет данных для обновления']);
        exit;
    }
    
    $params[] = $id;
    $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    // Удалить товар
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный ID']);
        exit;
    }
    
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Метод не разрешён']);
?>