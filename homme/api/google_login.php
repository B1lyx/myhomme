<?php
// google_login.php — перенаправляет на Google для авторизации
require_once 'config.php';
require_once 'auth_config.php';

if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    http_response_code(500);
    echo json_encode(['error' => 'Google OAuth не настроен. Заполни auth_config.php']);
    exit;
}

$params = [
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',
    'scope' => 'email profile',
    'access_type' => 'online',
    'prompt' => 'select_account'
];

$url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
header('Location: ' . $url);
exit;
?>