<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'db.php';

// Total bookings and revenue
$totals = $conn->query("
  SELECT
    COUNT(*)              AS total_bookings,
    SUM(total_amount)     AS total_revenue,
    SUM(num_guests)       AS total_guests
  FROM bookings
  WHERE status != 'cancelled'
")->fetch_assoc();

// Count by status
$byStatus = [];
$res = $conn->query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
while ($row = $res->fetch_assoc()) {
  $byStatus[$row['status']] = (int)$row['count'];
}

// Most popular items
$popular = [];
$res2 = $conn->query("
  SELECT item_name, SUM(quantity) AS total_booked
  FROM booking_items
  GROUP BY item_name
  ORDER BY total_booked DESC
  LIMIT 5
");
while ($row = $res2->fetch_assoc()) {
  $popular[] = $row;
}

echo json_encode([
  'success'  => true,
  'totals'   => $totals,
  'byStatus' => $byStatus,
  'popular'  => $popular
]);
?>