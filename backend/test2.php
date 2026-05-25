<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db.php';
echo "DB connected OK";
$result = $conn->query("SHOW TABLES");
while($row = $result->fetch_array()) {
    echo "<br>Table: " . $row[0];
}
