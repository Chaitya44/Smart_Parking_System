<?php
/**
 * register.php – Smart Parking System
 *
 * ROLE: Controller only. No HTML output from this file.
 *
 * Responsibilities:
 *   1. Validate POST data server-side.
 *   2. Build $errors[] and $safe[] for the view.
 *   3. Include register.html which renders everything.
 *
 * PHP include() processes .html files as PHP, so register.html
 * can safely use <?= $variable ?> without any server config change.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Trim a POST field safely; return '' if missing. */
function post(string $key): string {
    return trim($_POST[$key] ?? '');
}

/** Echo a value safely into HTML output. */
function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/** Return <small> error element for a field. */
function fieldError(array $errors, string $field, string $id): string {
    $msg = $errors[$field] ?? '';
    return '<small id="' . $id . '" class="error-message">' . h($msg) . '</small>';
}

/** Return "is-invalid" class string if a field has an error. */
function errClass(array $errors, string $field): string {
    return isset($errors[$field]) ? ' class="is-invalid"' : '';
}

// ── State ─────────────────────────────────────────────────────────────────────
$errors  = [];
$success = false;

// Values to re-populate the form on validation failure (passwords excluded)
$safe = ['full_name' => '', 'email' => '', 'mobile' => '', 'address' => ''];

// ── Server-side validation ────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $fullName        = post('full_name');
    $email           = strtolower(post('email'));
    $mobile          = post('mobile');
    $password        = $_POST['password']         ?? '';   // do NOT trim passwords
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $address         = post('address');
    $termsAccepted   = isset($_POST['terms']);

    // Safe values for form re-population (passwords excluded)
    // $termsChecked passed so the view never needs to read $_POST directly
    $safe = [
        'full_name'    => $fullName,
        'email'        => $email,
        'mobile'       => $mobile,
        'address'      => $address,
        'terms_checked' => $termsAccepted,
    ];

    // Full Name
    if ($fullName === '') {
        $errors['full_name'] = 'Full name is required.';
    } elseif (!preg_match('/^[A-Za-z ]{3,100}$/', $fullName)) {
        $errors['full_name'] = 'Name must be 3–100 letters and spaces only.';
    }

    // Email
    if ($email === '') {
        $errors['email'] = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please enter a valid email address.';
    }

    // Mobile (Indian 10-digit: starts with 6–9)
    if ($mobile === '') {
        $errors['mobile'] = 'Mobile number is required.';
    } elseif (!preg_match('/^[6-9]\d{9}$/', $mobile)) {
        $errors['mobile'] = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
    }

    // Password
    if ($password === '') {
        $errors['password'] = 'Password is required.';
    } elseif (strlen($password) < 8) {
        $errors['password'] = 'Password must be at least 8 characters.';
    } elseif (strlen($password) > 64) {
        $errors['password'] = 'Password must not exceed 64 characters.';
    } elseif (!preg_match('/[A-Z]/', $password)) {
        $errors['password'] = 'Password must contain at least one uppercase letter.';
    } elseif (!preg_match('/[a-z]/', $password)) {
        $errors['password'] = 'Password must contain at least one lowercase letter.';
    } elseif (!preg_match('/[0-9]/', $password)) {
        $errors['password'] = 'Password must contain at least one number.';
    } elseif (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors['password'] = 'Password must contain at least one special character.';
    }

    // Confirm Password
    if ($confirmPassword === '') {
        $errors['confirm_password'] = 'Please confirm your password.';
    } elseif ($confirmPassword !== $password) {
        $errors['confirm_password'] = 'Passwords do not match.';
    }

    // Address
    if ($address === '') {
        $errors['address'] = 'Address is required.';
    } elseif (strlen($address) < 10) {
        $errors['address'] = 'Address must be at least 10 characters.';
    } elseif (strlen($address) > 250) {
        $errors['address'] = 'Address must not exceed 250 characters.';
    }

    // Terms
    if (!$termsAccepted) {
        $errors['terms'] = 'You must accept the Terms & Conditions.';
    }

    // All valid → mark success
    // TODO (next phase): $hash = password_hash($password, PASSWORD_BCRYPT); INSERT INTO users ...
    if (empty($errors)) {
        $success = true;
    }
}

// ── Hand off to the HTML view ──────────────────────────────────────────────────
// include processes register.html as PHP so it can use $errors, $safe, $success.
include __DIR__ . '/register.html';
