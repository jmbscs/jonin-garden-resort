<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db.php';
require_once 'mailer.php';
$result = sendOTPEmail('test@gmail.com', 'Test User', '123456');
var_dump($result);
