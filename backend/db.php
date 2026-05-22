<?php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'jonin');
define('DB_PASS', 'jonin123');
define('DB_NAME', 'jonin_resort');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode([
    'success' => false,
    'message' => 'DB connection failed: ' . $conn->connect_error
  ]));
}
$conn->set_charset('utf8mb4');
?>