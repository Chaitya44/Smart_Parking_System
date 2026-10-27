<?php
/** Shared server-side authentication and role checks. */
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function json_error(string $message, int $status = 401): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function require_login(): void {
    if (empty($_SESSION['auth_id']) || empty($_SESSION['user_role'])) {
        json_error('Please log in to continue.', 401);
    }
}

function require_role(string $role): void {
    require_login();
    if (strtoupper((string)$_SESSION['user_role']) !== strtoupper($role)) {
        json_error('You do not have permission to access this resource.', 403);
    }
}

function require_admin(): void { require_role('ADMIN'); }
function require_customer(): void { require_role('USER'); }
