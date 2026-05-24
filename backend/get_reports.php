<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
  require_once 'db.php';

  // Total revenue and bookings this month
  $monthly = $conn->query("
    SELECT 
      COUNT(*) as total_bookings,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(SUM(num_guests), 0) as total_guests
    FROM bookings 
    WHERE status != 'cancelled'
    AND MONTH(booking_date) = MONTH(CURDATE())
    AND YEAR(booking_date) = YEAR(CURDATE())
  ")->fetch_assoc();

  // Revenue by item
  $byItem = [];
  $res = $conn->query("
    SELECT item_name,
      COUNT(*) as times_booked,
      SUM(price_each * quantity) as revenue
    FROM booking_items
    GROUP BY item_name
    ORDER BY revenue DESC
  ");
  while ($row = $res->fetch_assoc()) $byItem[] = $row;

  // Bookings per day last 14 days
  $byDay = [];
  $res2 = $conn->query("
    SELECT DATE(booking_date) as day,
      COUNT(*) as count,
      SUM(total_amount) as revenue
    FROM bookings
    WHERE booking_date >= CURDATE() - INTERVAL 14 DAY
    AND status != 'cancelled'
    GROUP BY DATE(booking_date)
    ORDER BY day ASC
  ");
  while ($row = $res2->fetch_assoc()) $byDay[] = $row;

  // Status breakdown
  $byStatus = [];
  $res3 = $conn->query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
  while ($row = $res3->fetch_assoc()) $byStatus[$row['status']] = (int)$row['count'];

  // Recent 5 bookings
  $recent = [];
  $res4 = $conn->query("
    SELECT b.booking_ref, b.booking_date, b.total_amount, b.status,
           g.name as guest_name
    FROM bookings b
    JOIN guests g ON b.guest_id = g.id
    ORDER BY b.created_at DESC
    LIMIT 5
  ");
  while ($row = $res4->fetch_assoc()) $recent[] = $row;

  // Top booking dates
  $topDates = [];
  $res5 = $conn->query("
    SELECT booking_date, COUNT(*) as count
    FROM bookings
    GROUP BY booking_date
    ORDER BY count DESC
    LIMIT 5
  ");
  while ($row = $res5->fetch_assoc()) $topDates[] = $row;

  echo json_encode([
    'success'  => true,
    'monthly'  => $monthly,
    'byItem'   => $byItem,
    'byDay'    => $byDay,
    'byStatus' => $byStatus,
    'recent'   => $recent,
    'topDates' => $topDates
  ]);

} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
?>