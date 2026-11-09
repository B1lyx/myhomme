<?php
// register.php — регистрация нового пользователя
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Валидация
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Заполните все поля']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Пароль минимум 6 символов']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный email']);
    exit;
}

// Проверяем, не занят ли email
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Этот email уже зарегистрирован']);
    exit;
}

// Хешируем пароль и сохраняем
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->execute([$name, $email, $hash]);

// Автоматически входим
$_SESSION['user_id'] = $pdo->lastInsertId();
$_SESSION['user_name'] = $name;
$_SESSION['user_email'] = $email;

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$_SESSION['user_id'],
        'name' => $name,
        'email' => $email
    ]
]);
?>