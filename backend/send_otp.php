<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';
require_once 'mailer.php';

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$name  = trim($data['name']  ?? '');

if (!$email || !$name) {
  die(json_encode(['success' => false, 'message' => 'Missing email or name.']));
}

// Check if email already registered
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param('s', $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
  die(json_encode(['success' => false, 'message' => 'Email is already registered.']));
}

// Rate limit — max 3 OTPs per email per 10 minutes
$rateCheck = $conn->prepare("
  SELECT COUNT(*) as cnt FROM otp_codes
  WHERE email = ? AND created_at > NOW() - INTERVAL 10 MINUTE
");
$rateCheck->bind_param('s', $email);
$rateCheck->execute();
$rate = $rateCheck->get_result()->fetch_assoc();
if ($rate['cnt'] >= 3) {
  die(json_encode(['success' => false, 'message' => 'Too many attempts. Please wait 10 minutes.']));
}

// Delete old OTPs for this email
$conn->prepare("DELETE FROM otp_codes WHERE email = ?")->execute() || 
$conn->query("DELETE FROM otp_codes WHERE email = '$email'");
$del = $conn->prepare("DELETE FROM otp_codes WHERE email = ?");
$del->bind_param('s', $email);
$del->execute();

// Generate 6-digit OTP
$otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

// Save OTP
$stmt = $conn->prepare("INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param('sss', $email, $otp, $expires);
$stmt->execute();

// Send email
$sent = sendOTPEmail($email, $name, $otp);

if ($sent) {
  echo json_encode(['success' => true, 'message' => 'OTP sent to ' . $email]);
} else {
  echo json_encode(['success' => false, 'message' => 'Failed to send email. Check mailer config.']);
}
?>