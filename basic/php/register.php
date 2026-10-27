
<?php
session_start();
require_once "db.php";

$wantsJson =
    (strpos($_SERVER["HTTP_ACCEPT"] ?? "", "application/json") !== false) ||
    (strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest");

function respond($success, $message, $redirect = null, $status = 200) {
    global $wantsJson;

    if ($wantsJson) {
        http_response_code($status);
        header("Content-Type: application/json; charset=UTF-8");

        $response = [
            "success" => $success,
            "message" => $message
        ];

        if ($redirect !== null) {
            $response["redirect"] = $redirect;
        }

        echo json_encode($response);
        exit;
    }

    header("Location: " . $redirect);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: ../html/register.html");
    exit;
}

$full_name = trim($_POST["full_name"] ?? "");
$email     = trim($_POST["email"] ?? "");
$mobile    = trim($_POST["mobile"] ?? "");
$password  = $_POST["password"] ?? "";
$address   = trim($_POST["address"] ?? "");

if ($full_name === "" || $email === "" ||
    $mobile === "" || $password === "") {
    respond(false, "Please fill in all mandatory fields.",
        "../html/register.html?error=missing_fields", 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "Please enter a valid email address.",
        "../html/register.html?error=invalid_email", 400);
}

if (!preg_match('/^\+?[0-9]{10,15}$/', $mobile)) {
    respond(false, "Please enter a valid mobile number.",
        "../html/register.html?error=invalid_mobile", 400);
}

if (strlen($password) < 8) {
    respond(false, "Password must contain at least 8 characters.",
        "../html/register.html?error=weak_password", 400);
}

try {
    $checkStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM users WHERE email = :email"
    );
    $checkStmt->execute([":email" => $email]);

    if ((int)$checkStmt->fetchColumn() > 0) {
        respond(false, "This email is already registered.",
            "../html/register.html?error=email_exists", 409);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $insertStmt = $pdo->prepare("
        INSERT INTO users
            (full_name, email, mobile, password, address, status, created_at)
        VALUES
            (:name, :email, :mobile, :password, :address, 'ACTIVE', NOW())
    ");

    $insertStmt->execute([
        ":name"     => $full_name,
        ":email"    => $email,
        ":mobile"   => $mobile,
        ":password" => $hashedPassword,
        ":address"  => $address
    ]);

    respond(true, "Account created successfully.",
        "../html/login.html?registered=1", 200);

} catch (PDOException $e) {
    error_log("Registration database error: " . $e->getMessage());

    respond(false, "Registration failed. Please try again.",
        "../html/register.html?error=server_error", 500);
}
?>
