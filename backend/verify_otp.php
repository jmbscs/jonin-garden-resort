<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email']    ?? '');
$code  = trim($data['otp']      ?? '');
$name  = trim($data['name']     ?? '');
$pass  = $data['password']      ?? '';

if (!$email || !$code) {
  die(json_encode(['success' => false, 'message' => 'Missing fields.']));
}

// Find valid OTP
$stmt = $conn->prepare("
  SELECT id FROM otp_codes
  WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()
");
$stmt->bind_param('ss', $email, $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  die(json_encode(['success' => false, 'message' => 'Invalid or expired code.']));
}

$otpRow = $result->fetch_assoc();

// Mark OTP as used
$markUsed = $conn->prepare("UPDATE otp_codes SET used = 1 WHERE id = ?");
$markUsed->bind_param('i', $otpRow['id']);
$markUsed->execute();

// Now create the user account
$hash = password_hash($pass, PASSWORD_DEFAULT);
$insert = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
$insert->bind_param('sss', $name, $email, $hash);
$insert->execute();

$userId = $conn->insert_id;

echo json_encode([
  'success' => true,
  'message' => 'Account verified and created!',
  'user'    => ['id' => $userId, 'name' => $name, 'email' => $email]
]);
?>