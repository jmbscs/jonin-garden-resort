<?php
header('Content-Type: application/json');
require_once 'db.php';

// Get all pending/active sessions for admin
$result = $conn->query("
  SELECT s.id, s.session_token, s.guest_name, s.guest_email, s.status, s.created_at,
    (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as message_count,
    (SELECT message FROM chat_messages WHERE session_id = s.id ORDER BY id DESC LIMIT 1) as last_message
  FROM chat_sessions s
  WHERE s.status != 'closed'
  ORDER BY s.created_at DESC
");

$sessions = $result->fetch_all(MYSQLI_ASSOC);
echo json_encode(['success' => true, 'sessions' => $sessions]);
?>
