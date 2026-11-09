<?php
// upload.php — загрузка изображения товара
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл не загружен']);
    exit;
}

$file = $_FILES['image'];
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($file['type'], $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Только JPG, PNG, WEBP, GIF']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл больше 5 МБ']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$dest = $uploadDir . $filename;
if (move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => true, 'path' => 'uploads/' . $filename]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сохранения файла']);
}
?>