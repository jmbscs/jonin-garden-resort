<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'db.php';

// JOIN bookings with guests to get name/email in one query
$sql = "
  SELECT
    b.id, b.booking_ref, b.booking_date, b.num_guests,
    b.total_amount, b.payment_method, b.payment_status,
    b.status, b.special_requests, b.qr_data, b.created_at,
    g.name  AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone
  FROM bookings b
  JOIN guests g ON b.guest_id = g.id
  ORDER BY b.created_at DESC
";

$result = $conn->query($sql);

if (!$result) {
  http_response_code(500);
  die(json_encode(['success' => false, 'message' => $conn->error]));
}

$bookings = [];
while ($row = $result->fetch_assoc()) {

  // For each booking, also fetch its items
  $bid = (int)$row['id'];
  $iStmt = $conn->prepare(
    "SELECT item_name, quantity, price_each FROM booking_items WHERE booking_id = ?"
  );
  $iStmt->bind_param('i', $bid);
  $iStmt->execute();
  $iResult = $iStmt->get_result();

  $row['selectedItems'] = $iResult->fetch_all(MYSQLI_ASSOC);
  $bookings[] = $row;
}

echo json_encode(['success' => true, 'bookings' => $bookings]);
?>