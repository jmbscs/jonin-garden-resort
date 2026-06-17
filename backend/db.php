<?php
date_default_timezone_set('Asia/Manila');

define('DB_HOST', getenv('MYSQLHOST') ?: '127.0.0.1'); define('DB_USER', getenv('MYSQLUSER') ?: 'jonin'); define('DB_PASS', getenv('MYSQLPASSWORD') ?: 'jonin123'); define('DB_NAME', getenv('MYSQLDATABASE') ?: 'jonin_resort'); define('DB_PORT', getenv('MYSQLPORT') ?: '3306');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, (int)DB_PORT);

if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode([
    'success' => false,
    'message' => 'DB connection failed: ' . $conn->connect_error
  ]));
}
$conn->set_charset('utf8mb4');
$conn->query("SET time_zone = '+08:00'");
?>
