<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$bookingId     = (int)($data['bookingId'] ?? 0);
$newStatus     = $data['status']        ?? null;
$paymentStatus = $data['paymentStatus'] ?? null;

// Build update query dynamically based on what was sent
$fields = [];
$types  = '';
$params = [];

if ($newStatus) {
  $allowed = ['pending', 'confirmed', 'cancelled'];
  if (!in_array($newStatus, $allowed)) {
    die(json_encode(['success' => false, 'message' => 'Invalid status']));
  }
  $fields[] = 'status = ?';
  $types   .= 's';
  $params[] = &$newStatus;
}

if ($paymentStatus) {
  $allowed2 = ['unpaid', 'partial', 'paid'];
  if (!in_array($paymentStatus, $allowed2)) {
    die(json_encode(['success' => false, 'message' => 'Invalid payment status']));
  }
  $fields[] = 'payment_status = ?';
  $types   .= 's';
  $params[] = &$paymentStatus;
}

if (empty($fields)) {
  die(json_encode(['success' => false, 'message' => 'Nothing to update']));
}

$types   .= 'i';
$params[] = &$bookingId;

$sql  = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
array_unshift($params, $types);
call_user_func_array([$stmt, 'bind_param'], $params);
$stmt->execute();

echo json_encode([
  'success' => true,
  'message' => 'Booking updated.',
  'affected' => $stmt->affected_rows
]);
?>