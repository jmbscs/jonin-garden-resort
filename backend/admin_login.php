<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email']    ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
  die(json_encode(['success' => false, 'message' => 'Email and password required.']));
}

$stmt = $conn->prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ? AND role = 'admin'");
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user['password_hash'])) {
  die(json_encode(['success' => false, 'message' => 'Invalid admin credentials.']));
}

unset($user['password_hash']);

echo json_encode([
  'success' => true,
  'user'    => $user
]);
?>