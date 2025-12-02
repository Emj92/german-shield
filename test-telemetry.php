<?php
/**
 * Telemetry Test Script
 * Sendet einen Test-Event an das Portal
 */

$portal_url = 'http://localhost:3000';

$test_data = array(
    'ip_hash' => hash('sha256', '127.0.0.1' . time()),
    'country_code' => 'DE',
    'block_method' => 'test',
    'block_reason' => 'Telemetry Test',
    'email_domain_hash' => hash('sha256', 'test.com'),
    'spam_domains' => null,
    'user_agent_hash' => hash('sha256', 'Test User Agent'),
    'plugin_version' => '1.0.0',
    'site_url_hash' => hash('sha256', 'http://localhost'),
);

echo "🔧 Sende Test-Event an Portal...\n";
echo "URL: {$portal_url}/api/telemetry\n\n";

$ch = curl_init($portal_url . '/api/telemetry');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'X-Plugin-Version: 1.0.0',
));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Status: {$http_code}\n";

if ($error) {
    echo "❌ FEHLER: {$error}\n";
    echo "\nIST DER PORTAL-SERVER AUF PORT 3000 GESTARTET?\n";
    exit(1);
}

echo "📥 Antwort: {$response}\n";

$result = json_decode($response, true);

if ($http_code === 200 && isset($result['success']) && $result['success']) {
    echo "\n✅ TELEMETRIE FUNKTIONIERT!\n";
    echo "Event ID: {$result['id']}\n";
} else {
    echo "\n❌ TELEMETRIE FEHLER!\n";
    echo "Prüfe die Server-Logs im Portal!\n";
}

