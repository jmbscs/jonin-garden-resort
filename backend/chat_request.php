<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(); }
require_once 'db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$name  = trim($data['name']  ?? '');
$email = trim($data['email'] ?? '');

if (!$name || !$email) {
  die(json_encode(['success' => false, 'message' => 'Name and email required.']));
}

$token = bin2hex(random_bytes(32));

$stmt = $conn->prepare("INSERT INTO chat_sessions (session_token, guest_name, guest_email) VALUES (?, ?, ?)");
$stmt->bind_param('sss', $token, $name, $email);
$stmt->execute();
$sessionId = $conn->insert_id;

echo json_encode(['success' => true, 'session_id' => $sessionId, 'token' => $token]);
?>
