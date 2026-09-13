<?php
/**
 * Smart Parking System - User Registration
 * Strictly uses PHP PDO with prepared statements.
 */

session_start();
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $full_name = trim($_POST["full_name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $mobile = trim($_POST["mobile"] ?? "");
    $password = $_POST["password"] ?? "";
    $address = trim($_POST["address"] ?? "");

    // Validate mandatory fields
    if (empty($full_name) || empty($email) || empty($mobile) || empty($password)) {
        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            echo json_encode(["success" => false, "message" => "Please fill in all mandatory fields."]);
            exit;
        }
        header("Location: ../html/register.html?error=missing_fields");
        exit;
    }

    try {
        // Check if email already registered in USERS or ADMINS
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $checkStmt->execute([':email' => $email]);
        if ($checkStmt->fetchColumn() > 0) {
            if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
                echo json_encode(["success" => false, "message" => "This email is already registered."]);
                exit;
            }
            header("Location: ../html/register.html?error=email_exists");
            exit;
        }

        // Secure password hashing
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert new customer record
        $insertStmt = $pdo->prepare("
            INSERT INTO users (full_name, email, mobile, password, address, status, created_at)
            VALUES (:name, :email, :mobile, :password, :address, 'ACTIVE', NOW())
        ");

        $insertStmt->execute([
            ':name'     => $full_name,
            ':email'    => $email,
            ':mobile'   => $mobile,
            ':password' => $hashed_password,
            ':address'  => $address
        ]);

        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            echo json_encode(["success" => true, "message" => "Account created successfully.", "redirect" => "../html/login.html?registered=1"]);
            exit;
        }
        header("Location: ../html/login.html?registered=1");
        exit;

    } catch (PDOException $e) {
        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            echo json_encode(["success" => false, "message" => "Registration error: " . $e->getMessage()]);
            exit;
        }
        header("Location: ../html/register.html?error=server_error");
        exit;
    }
} else {
    header("Location: ../html/register.html");
    exit;
}
?>
