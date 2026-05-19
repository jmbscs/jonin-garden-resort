<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

$data     = json_decode(file_get_contents('php://input'), true);
$name     = trim($data['name']  ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password']   ?? '';

if (!$name || !$email || !$password) {
  die(json_encode(['success' => false, 'message' => 'All fields are required.']));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  die(json_encode(['success' => false, 'message' => 'Invalid email address.']));
}

if (strlen($password) < 6) {
  die(json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']));
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param('s', $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
  die(json_encode(['success' => false, 'message' => 'Email already registered.']));
}

// Hash the password — never store plain text
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param('sss', $name, $email, $hash);
$stmt->execute();

echo json_encode([
  'success' => true,
  'message' => 'Account created! You can now log in.',
  'user'    => ['id' => $conn->insert_id, 'name' => $name, 'email' => $email]
]);
?>