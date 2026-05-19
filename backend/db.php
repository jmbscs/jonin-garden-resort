<?php

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // default XAMPP user
define('DB_PASS', '');             // default XAMPP password (blank)
define('DB_NAME', 'jonin_resort');

// Create connection using MySQLi
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Stop if connection fails
if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode([
    'success' => false,
    'message' => 'Database connection failed: ' . $conn->connect_error
  ]));
}

// Set charset for Filipino characters (accented names, etc.)
$conn->set_charset('utf8mb4');

?>
