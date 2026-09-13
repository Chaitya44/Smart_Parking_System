<?php
/**
 * Smart Parking System - User & Staff API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $admins = $pdo->query("SELECT admin_id, full_name, email, mobile, designation, status, created_at, last_login FROM admins ORDER BY created_at DESC")->fetchAll();
        $users  = $pdo->query("SELECT user_id, full_name, email, mobile, address, status, created_at FROM users ORDER BY created_at DESC")->fetchAll();

        echo json_encode([
            'success' => true,
            'data'    => [
                'admins' => $admins,
                'users'  => $users
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to load users: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'POST') {
    // Add new staff / operator
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $name        = trim($input['name'] ?? '');
    $email       = trim($input['email'] ?? '');
    $mobile      = trim($input['mobile'] ?? '');
    $password    = $input['password'] ?? 'admin123';
    $designation = trim($input['designation'] ?? 'Operator');

    if (empty($name) || empty($email) || empty($mobile)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Name, email, and mobile are required.']);
        exit;
    }

    try {
        $check = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE email = :email");
        $check->execute([':email' => $email]);
        if ($check->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Admin with this email already exists.']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $insert = $pdo->prepare("
            INSERT INTO admins (full_name, email, mobile, password, designation, status, created_at)
            VALUES (:name, :email, :mobile, :pass, :desig, 'ACTIVE', NOW())
        ");
        $insert->execute([
            ':name'  => $name,
            ':email' => $email,
            ':mobile'=> $mobile,
            ':pass'  => $hash,
            ':desig' => $designation
        ]);

        echo json_encode(['success' => true, 'message' => "Operator $name added successfully."]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add operator: ' . $e->getMessage()]);
        exit;
    }
}
?>
