<?php
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if (empty($email) || empty($password)) {
        header("Location: ../html/login.html?error=missing_fields");
        exit;
    }

    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row["password"])) {
            header("Location: ../html/dashboard.html");
            exit;
        }
    }

    header("Location: ../html/login.html?error=invalid_credentials");
    exit;
} else {
    header("Location: ../html/login.html");
    exit;
}
?>
