<?php
require_once 'db.php';
$hash = password_hash('admin123', PASSWORD_BCRYPT);
$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@jonin.com'");
$stmt->bind_param('s', $hash);
$stmt->execute();
echo "Done! Hash: " . $hash;
