<?php
require_once 'auth.php';
header('Content-Type: application/json; charset=UTF-8');
if (empty($_SESSION['auth_id']) || empty($_SESSION['user_role'])) {
    http_response_code(401);
    echo json_encode(['authenticated' => false]);
    exit;
}
echo json_encode([
    'authenticated' => true,
    'auth_id' => (int)$_SESSION['auth_id'],
    'user_name' => (string)($_SESSION['user_name'] ?? ''),
    'user_email' => (string)($_SESSION['user_email'] ?? ''),
    'role' => strtoupper((string)$_SESSION['user_role'])
]);
