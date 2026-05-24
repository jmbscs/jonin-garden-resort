<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200); exit();
}

require_once 'db.php';

$data       = json_decode(file_get_contents('php://input'), true);
$bookingRef = trim($data['ref']       ?? '');
$scannedBy  = trim($data['scannedBy'] ?? 'staff');

if (!$bookingRef) {
  die(json_encode(['success' => false, 'message' => 'No booking reference scanned.']));
}

// Get booking info
$stmt = $conn->prepare("
  SELECT b.id, b.booking_ref, b.booking_date, b.status, b.checkin_status,
         g.name AS guest_name, g.email
  FROM bookings b
  JOIN guests g ON b.guest_id = g.id
  WHERE b.booking_ref = ?
");
$stmt->bind_param('s', $bookingRef);
$stmt->execute();
$booking = $stmt->get_result()->fetch_assoc();

if (!$booking) {
  die(json_encode(['success' => false, 'message' => 'Booking not found.']));
}

if ($booking['status'] === 'cancelled') {
  die(json_encode(['success' => false, 'message' => 'This booking has been cancelled.']));
}

// Check existing attendance record
$attStmt = $conn->prepare("SELECT * FROM attendance WHERE booking_id = ?");
$attStmt->bind_param('i', $booking['id']);
$attStmt->execute();
$attendance = $attStmt->get_result()->fetch_assoc();

$now = date('Y-m-d H:i:s');

if (!$attendance) {
  // First scan = TIME IN
  $ins = $conn->prepare("
    INSERT INTO attendance (booking_id, booking_ref, guest_name, time_in, scanned_by)
    VALUES (?, ?, ?, ?, ?)
  ");
  $ins->bind_param('issss', $booking['id'], $bookingRef, $booking['guest_name'], $now, $scannedBy);
  $ins->execute();

  $upd = $conn->prepare("UPDATE bookings SET checkin_status = 'checked_in' WHERE id = ?");
  $upd->bind_param('i', $booking['id']);
  $upd->execute();

  echo json_encode([
    'success' => true,
    'action'  => 'time_in',
    'message' => 'Time In recorded!',
    'guest'   => $booking['guest_name'],
    'time'    => $now,
    'ref'     => $bookingRef
  ]);

} elseif ($attendance['time_in'] && !$attendance['time_out']) {
  // Second scan = TIME OUT
  $upd = $conn->prepare("UPDATE attendance SET time_out = ? WHERE id = ?");
  $upd->bind_param('si', $now, $attendance['id']);
  $upd->execute();

  $in       = new DateTime($attendance['time_in']);
  $out      = new DateTime($now);
  $duration = $in->diff($out);
  $hours    = $duration->h + ($duration->days * 24);
  $mins     = $duration->i;

  $upd2 = $conn->prepare("UPDATE bookings SET checkin_status = 'checked_out' WHERE id = ?");
  $upd2->bind_param('i', $booking['id']);
  $upd2->execute();

  echo json_encode([
    'success'  => true,
    'action'   => 'time_out',
    'message'  => 'Time Out recorded!',
    'guest'    => $booking['guest_name'],
    'time_in'  => $attendance['time_in'],
    'time_out' => $now,
    'duration' => $hours . 'h ' . $mins . 'm',
    'ref'      => $bookingRef
  ]);

} else {
  echo json_encode([
    'success' => false,
    'message' => 'Guest already checked out at ' . $attendance['time_out']
  ]);
}
?>