<?php
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $full_name = trim($_POST["full_name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $mobile = trim($_POST["mobile"] ?? "");
    $password = $_POST["password"] ?? "";
    $address = trim($_POST["address"] ?? "");

    if (empty($full_name) || empty($email) || empty($mobile) || empty($password)) {
        header("Location: ../html/register.html?error=missing_fields");
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, mobile, password, address) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $full_name, $email, $mobile, $hashed_password, $address);

    if ($stmt->execute()) {
        header("Location: ../html/login.html?registered=1");
        exit;
    } else {
        header("Location: ../html/register.html?error=email_exists");
        exit;
    }
} else {
    header("Location: ../html/register.html");
    exit;
}
?>
