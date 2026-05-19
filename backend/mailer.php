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
?>