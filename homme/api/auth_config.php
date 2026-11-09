<?php
// auth_config.php — настройки авторизации (заполни свои данные)
// Как получить: https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID

define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET_HERE');
define('GOOGLE_REDIRECT_URI', 'http://localhost/homme/api/google_callback.php');
?>