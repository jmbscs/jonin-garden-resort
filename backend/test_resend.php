<?php
require_once 'db.php';
$apiKey = getenv('RESEND_API_KEY');
echo "API Key exists: " . (empty($apiKey) ? 'NO' : 'YES - length: ' . strlen($apiKey)) . "<br>";

$payload = json_encode([
  'from'    => 'Jo-Nin Garden Resort <onboarding@resend.dev>',
  'to'      => ['voluntad.j.m.bscs@gmail.com'],
  'subject' => 'Test Email',
  'html'    => '<p>Test from Jo-Nin!</p>'
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

echo "HTTP Code: " . $httpCode . "<br>";
echo "Response: " . $response;
?>
