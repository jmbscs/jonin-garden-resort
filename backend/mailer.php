<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function sendOTPEmail($toEmail, $toName, $otp) {
  $mail = new PHPMailer(true);

  try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'joningardenresort26@gmail.com';   // ← your Gmail
    $mail->Password   = 'ilez iwmx fdns pszr'; // ← Gmail App Password (not your real password)
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('joningardenresort26@gmail.com', 'Jo-Nin Garden Resort');
    $mail->addAddress($toEmail, $toName);

    $mail->isHTML(true);
    $mail->Subject = 'Your Jo-Nin Verification Code';
    $mail->Body    = "
      <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px'>
        <h2 style='color:#1B6B3A'>Jo-Nin Garden Resort</h2>
        <p>Hi <strong>$toName</strong>,</p>
        <p>Your verification code is:</p>
        <div style='font-size:36px;font-weight:bold;letter-spacing:10px;color:#1B6B3A;margin:24px 0'>$otp</div>
        <p style='color:#888'>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    ";

    $mail->send();
    return true;
  } catch (Exception $e) {
    return false;
  }
}

function sendBookingConfirmationEmail($toEmail, $toName, $bookingRef, $date, $items, $total, $guests) {
  $mail = new PHPMailer(true);
  try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'joningardenresort26@gmail.com';
    $mail->Password   = 'ilez iwmx fdns pszr';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('joningardenresort26@gmail.com', 'Jo-Nin Garden Resort');
    $mail->addAddress($toEmail, $toName);

    $mail->isHTML(true);
    $mail->Subject = 'Booking Confirmed — ' . $bookingRef;

    $itemsList = implode('<br>', array_map(fn($i) => '• ' . $i, $items));

    $mail->Body = "
      <div style='font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px'>
        <h2 style='color:#1B6B3A'>✅ Booking Confirmed!</h2>
        <p>Hi <strong>$toName</strong>, your booking has been received.</p>
        <div style='background:#f9f9f9;border-radius:8px;padding:20px;margin:20px 0'>
          <p><strong>Booking Reference:</strong> <span style='color:#1B6B3A;font-size:18px;letter-spacing:2px'>$bookingRef</span></p>
          <p><strong>Date of Visit:</strong> $date</p>
          <p><strong>Number of Guests:</strong> $guests</p>
          <p><strong>Selected Items:</strong><br>$itemsList</p>
          <p><strong>Total Amount:</strong> ₱" . number_format($total, 2) . "</p>
        </div>
        <p>Please show your <strong>Booking Reference</strong> or QR code at the entrance.</p>
        <div style='background:#1B6B3A;color:white;text-align:center;padding:16px;border-radius:8px;font-size:22px;letter-spacing:4px;font-weight:bold;margin:20px 0'>
          $bookingRef
        </div>
        <p style='color:#888;font-size:13px'>If you have questions, contact us at info@joningardenresort.ph or call +63 912 345 6789.</p>
        <p style='color:#1B6B3A;font-weight:bold'>Jo-Nin Garden Resort — Your sunny escape in the heart of nature. 🌿</p>
      </div>
    ";

    $mail->send();
    return true;
  } catch (Exception $e) {
    return false;
  }
}
?>