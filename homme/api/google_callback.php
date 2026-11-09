<?php
// google_callback.php — обработка ответа от Google
require_once 'config.php';
require_once 'auth_config.php';

if (!isset($_GET['code'])) {
    header('Location: ../login.html?error=google_failed');
    exit;
}

// Обмениваем код на токен
$tokenUrl = 'https://oauth2.googleapis.com/token';
$postData = [
    'code' => $_GET['code'],
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$response = curl_exec($ch);
curl_close($ch);

$tokenData = json_decode($response, true);

if (!isset($tokenData['access_token'])) {
    header('Location: ../login.html?error=token_failed');
    exit;
}

// Получаем данные пользователя
$userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $tokenData['access_token'];
$userInfo = json_decode(file_get_contents($userInfoUrl), true);

if (!isset($userInfo['email'])) {
    header('Location: ../login.html?error=userinfo_failed');
    exit;
}

$email = $userInfo['email'];
$name = $userInfo['name'] ?? $userInfo['given_name'] ?? 'Google User';
$googleId = $userInfo['id'] ?? '';

// Проверяем, есть ли пользователь в БД
$stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // Создаём нового пользователя (без пароля — через Google)
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, 'GOOGLE_OAUTH_' . $googleId]);
    $userId = $pdo->lastInsertId();
} else {
    $userId = $user['id'];
    $name = $user['name'];
}

// Входим
$_SESSION['user_id'] = $userId;
$_SESSION['user_name'] = $name;
$_SESSION['user_email'] = $email;

header('Location: ../account.html');
exit;
?>