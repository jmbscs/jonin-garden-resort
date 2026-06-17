<?php
date_default_timezone_set('Asia/Manila');

define('DB_HOST', getenv('MYSQLHOST')     ?: 'mysql-2e8062c5-jonin-garden-resort.e.aivencloud.com');
define('DB_USER', getenv('MYSQLUSER')     ?: 'avnadmin');
define('DB_PASS', getenv('MYSQLPASSWORD') ?: 'AVNS_T41ZinKjsLv0pIyUgzM');
define('DB_NAME', getenv('MYSQLDATABASE') ?: 'defaultdb');
define('DB_PORT', getenv('MYSQLPORT')     ?: '19337');

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
