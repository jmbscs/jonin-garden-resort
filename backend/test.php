<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "MYSQLHOST: " . getenv('MYSQLHOST') . "<br>";
echo "MYSQLUSER: " . getenv('MYSQLUSER') . "<br>";
echo "MYSQLDATABASE: " . getenv('MYSQLDATABASE') . "<br>";
echo "MYSQLPORT: " . getenv('MYSQLPORT') . "<br>";

$conn = new mysqli(
    getenv('MYSQLHOST'),
    getenv('MYSQLUSER'),
    getenv('MYSQLPASSWORD'),
    getenv('MYSQLDATABASE'),
    (int)getenv('MYSQLPORT')
);

if ($conn->connect_error) {
    echo "Connection FAILED: " . $conn->connect_error;
} else {
    echo "Connection SUCCESS!";
}
