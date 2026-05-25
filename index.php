<?php
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '.php') !== false || strpos($uri, '.css') !== false || strpos($uri, '.js') !== false || strpos($uri, '/images/') !== false) {
    return false;
}
header('Location: /homepage_index.html');
exit;
