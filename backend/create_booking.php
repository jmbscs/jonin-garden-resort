<?php
// Allow requests from your frontend (CORS)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';
require_once 'mailer.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  die(json_encode(['success' => false, 'message' => 'POST only']));
}

// Read JSON body sent by JavaScript fetch()
$data = json_decode(file_get_contents('php://input'), true);

// Pull fields (with fallbacks)
$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$phone    = trim($data['phone'] ?? '');
$date     = $data['date'] ?? '';
$guests   = (int)($data['guests'] ?? 1);
$total    = (float)($data['totalAmount'] ?? 0);
$payment  = $data['paymentMethod'] ?? 'cash';
$paystat  = $data['paymentStatus'] ?? 'unpaid';
$notes    = $data['specialRequests'] ?? '';
$items    = $data['selectedItems'] ?? [];

// Basic validation
if (!$name || !$email || !$date) {
  die(json_encode(['success' => false, 'message' => 'Name, email, and date are required.']));
}

// Generate a booking reference number
$ref = 'JNR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

/* ---- START TRANSACTION (all-or-nothing) ---- */
$conn->begin_transaction();

try {

  // Step 1: Insert guest
  $stmt = $conn->prepare(
    "INSERT INTO guests (name, email, phone) VALUES (?, ?, ?)"
  );
  $stmt->bind_param('sss', $name, $email, $phone);
  $stmt->execute();
  $guestId = $conn->insert_id;

  // Step 2: Insert booking
  $qrData = $ref . '|' . $name . '|' . $date . '|' . $total;
  $stmt2 = $conn->prepare("
    INSERT INTO bookings
      (booking_ref, guest_id, booking_date, num_guests,
       total_amount, payment_method, payment_status,
       special_requests, qr_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  $stmt2->bind_param(
    'sisisssss',
    $ref, $guestId, $date, $guests,
    $total, $payment, $paystat,
    $notes, $qrData
  );
  $stmt2->execute();
  $bookingId = $conn->insert_id;

  // Step 3: Insert each selected item
  $stmt3 = $conn->prepare(
    "INSERT INTO booking_items (booking_id, item_name, quantity, price_each) VALUES (?, ?, ?, ?)"
  );
  foreach ($items as $item) {
    $itemName  = $item['name'];
    $qty       = (int)($item['quantity'] ?? 1);
    $price     = (float)($item['price'] ?? 0);
    $stmt3->bind_param('isid', $bookingId, $itemName, $qty, $price);
    $stmt3->execute();
  }

  $conn->commit();

// Send confirmation email
$itemNames = array_map(fn($i) => $i['name'], $items);
sendBookingConfirmationEmail($email, $name, $ref, $date, $itemNames, $total, $guests);

  echo json_encode([
    'success'    => true,
    'bookingRef' => $ref,
    'bookingId'  => $bookingId,
    'qrData'     => $qrData,
    'message'    => 'Booking created successfully!'
  ]);

} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>