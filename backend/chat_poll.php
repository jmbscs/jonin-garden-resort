<?php
header('Content-Type: application/json');
require_once 'db.php';

$sessionId = (int)($_GET['session_id'] ?? 0);
$after     = (int)($_GET['after']      ?? 0);

if (!$sessionId) {
  die(json_encode(['success' => false, 'message' => 'Invalid session.']));
}

$sess = $conn->prepare("SELECT status, guest_name FROM chat_sessions WHERE id = ?");
$sess->bind_param('i', $sessionId);
$sess->execute();
$session = $sess->get_result()->fetch_assoc();

if (!$session) {
  die(json_encode(['success' => false, 'message' => 'Session not found.']));
}

$stmt = $conn->prepare("SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = ? AND id > ? ORDER BY id ASC");
$stmt->bind_param('ii', $sessionId, $after);
$stmt->execute();
$messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode([
  'success'  => true,
  'status'   => $session['status'],
  'guest'    => $session['guest_name'],
  'messages' => $messages
]);
?>
