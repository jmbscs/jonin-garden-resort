<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(); }
require_once 'db.php';

$data      = json_decode(file_get_contents('php://input'), true);
$sessionId = (int)($data['session_id'] ?? 0);

if (!$sessionId) {
  die(json_encode(['success' => false, 'message' => 'Invalid session.']));
}

$stmt = $conn->prepare("UPDATE chat_sessions SET status = 'closed' WHERE id = ?");
$stmt->bind_param('i', $sessionId);
$stmt->execute();

echo json_encode(['success' => true]);
?>
