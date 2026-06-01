<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(); }
require_once 'db.php';

$data      = json_decode(file_get_contents('php://input'), true);
$sessionId = (int)($data['session_id'] ?? 0);
$token     = trim($data['token']       ?? '');
$sender    = trim($data['sender']      ?? '');
$message   = trim($data['message']     ?? '');

if (!$sessionId || !$message || !in_array($sender, ['guest', 'admin'])) {
  die(json_encode(['success' => false, 'message' => 'Invalid request.']));
}

// Verify session exists and token matches for guests
if ($sender === 'guest') {
  $check = $conn->prepare("SELECT id FROM chat_sessions WHERE id = ? AND session_token = ?");
  $check->bind_param('is', $sessionId, $token);
  $check->execute();
  $check->store_result();
  if ($check->num_rows === 0) {
    die(json_encode(['success' => false, 'message' => 'Invalid session.']));
  }
  // Update session to active if pending
  $conn->prepare("UPDATE chat_sessions SET status = 'active' WHERE id = ? AND status = 'pending'")->execute();
}

$message = substr($message, 0, 1000);
$stmt = $conn->prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)");
$stmt->bind_param('iss', $sessionId, $sender, $message);
$stmt->execute();

echo json_encode(['success' => true]);
?>
