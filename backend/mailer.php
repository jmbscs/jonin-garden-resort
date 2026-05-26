<?php

function sendOTPEmail($toEmail, $toName, $otp) {
  $apiKey = getenv('RESEND_API_KEY');

  $payload = json_encode([
    'from'    => 'Jo-Nin Garden Resort <onboarding@resend.dev>',
    'to'      => [$toEmail],
    'subject' => 'Your Jo-Nin Verification Code',
    'html'    => "
      <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px'>
        <h2 style='color:#1B6B3A'>Jo-Nin Garden Resort</h2>
        <p>Hi <strong>$toName</strong>,</p>
        <p>Your verification code is:</p>
        <div style='font-size:36px;font-weight:bold;letter-spacing:10px;color:#1B6B3A;margin:24px 0'>$otp</div>
        <p style='color:#888'>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    "
  ]);

  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
  ]);

  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  return $httpCode === 200;
}

function sendBookingConfirmationEmail($toEmail, $toName, $ref, $date, $items, $total, $guests) {
  $apiKey    = getenv('RESEND_API_KEY');
  $itemsList = implode(', ', $items);

  $payload = json_encode([
    'from'    => 'Jo-Nin Garden Resort <onboarding@resend.dev>',
    'to'      => [$toEmail],
    'subject' => 'Booking Confirmed — ' . $ref,
    'html'    => "
      <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px'>
        <h2 style='color:#1B6B3A'>Booking Confirmed!</h2>
        <p>Hi <strong>$toName</strong>, your booking is confirmed.</p>
        <table style='width:100%;border-collapse:collapse;margin:16px 0'>
          <tr><td style='padding:8px;color:#888'>Reference</td><td style='padding:8px'><strong>$ref</strong></td></tr>
          <tr><td style='padding:8px;color:#888'>Date</td><td style='padding:8px'>$date</td></tr>
          <tr><td style='padding:8px;color:#888'>Guests</td><td style='padding:8px'>$guests</td></tr>
          <tr><td style='padding:8px;color:#888'>Items</td><td style='padding:8px'>$itemsList</td></tr>
          <tr><td style='padding:8px;color:#888'>Total</td><td style='padding:8px'><strong>₱" . number_format($total, 2) . "</strong></td></tr>
        </table>
        <p style='color:#888'>Please present your QR code upon arrival. See you at Jo-Nin Garden Resort!</p>
      </div>
    "
  ]);

  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
  ]);

  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  return $httpCode === 200;
}
