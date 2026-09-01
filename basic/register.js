// =============================================
//   Smart Parking System - Form Validation
//   File: register.js
//   
//   How this file works:
//   1. Wait for the page to fully load (DOMContentLoaded)
//   2. When the form is submitted → validate every field
//   3. If any field has an error → stop submission, show error
//   4. If all fields are valid  → show success message
//   5. Live feedback as user types (blur events)
// =============================================

// ---- Regular Expressions (pattern rules) ----
// These define what is and is not valid input

// Name: only letters and spaces, 3 to 100 characters
var NAME_PATTERN = /^[A-Za-z ]{3,100}$/;

// Email: must have characters, @, domain, and .extension
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mobile: must start with 6,7,8 or 9 and have exactly 10 digits
var MOBILE_PATTERN = /^[6-9]\d{9}$/;


// =============================================
// HELPER FUNCTIONS
// These small functions do one job each
// =============================================

// showError: marks a field red and shows an error message
function showError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorBox = document.getElementById(errorId);

    input.classList.remove("valid");  // remove green border
    input.classList.add("error");     // add red border

    errorBox.textContent = message;   // show the error text
}

// clearError: marks a field green and hides the error message
function clearError(inputId, errorId) {
    var input = document.getElementById(inputId);
    var errorBox = document.getElementById(errorId);

    input.classList.remove("error");  // remove red border
    input.classList.add("valid");     // add green border

    errorBox.textContent = "";        // clear the error text
}


// =============================================
// FIELD VALIDATION FUNCTIONS
// Each function validates one field.
// Returns true if valid, false if invalid.
// =============================================

function validateFullName() {
    var value = document.getElementById("full_name").value.trim();

    if (value === "") {
        showError("full_name", "fullNameError", "Full name is required.");
        return false;
    }
    if (!NAME_PATTERN.test(value)) {
        showError("full_name", "fullNameError", "Name must be 3-100 letters and spaces only. No numbers or symbols.");
        return false;
    }

    clearError("full_name", "fullNameError");
    return true;
}

function validateEmail() {
    // toLowerCase: convert to lowercase before checking
    var value = document.getElementById("email").value.trim().toLowerCase();

    if (value === "") {
        showError("email", "emailError", "Email address is required.");
        return false;
    }
    if (!EMAIL_PATTERN.test(value)) {
        showError("email", "emailError", "Please enter a valid email address (e.g. name@example.com).");
        return false;
    }

    clearError("email", "emailError");
    return true;
}

function validateMobile() {
    var value = document.getElementById("mobile").value.trim();

    if (value === "") {
        showError("mobile", "mobileError", "Mobile number is required.");
        return false;
    }
    if (!MOBILE_PATTERN.test(value)) {
        showError("mobile", "mobileError", "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.");
        return false;
    }

    clearError("mobile", "mobileError");
    return true;
}

function validatePassword() {
    var value = document.getElementById("password").value;
    // Note: we do NOT trim passwords — spaces are allowed in passwords

    if (value === "") {
        showError("password", "passwordError", "Password is required.");
        return false;
    }
    if (value.length < 8) {
        showError("password", "passwordError", "Password must be at least 8 characters.");
        return false;
    }
    if (value.length > 64) {
        showError("password", "passwordError", "Password must not exceed 64 characters.");
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        showError("password", "passwordError", "Password must contain at least one uppercase letter (A-Z).");
        return false;
    }
    if (!/[a-z]/.test(value)) {
        showError("password", "passwordError", "Password must contain at least one lowercase letter (a-z).");
        return false;
    }
    if (!/[0-9]/.test(value)) {
        showError("password", "passwordError", "Password must contain at least one number (0-9).");
        return false;
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
        showError("password", "passwordError", "Password must contain at least one special character (e.g. @, #, !).");
        return false;
    }

    clearError("password", "passwordError");
    return true;
}

function validateConfirmPassword() {
    var password = document.getElementById("password").value;
    var confirm  = document.getElementById("confirm_password").value;

    if (confirm === "") {
        showError("confirm_password", "confirmError", "Please confirm your password.");
        return false;
    }
    if (confirm !== password) {
        showError("confirm_password", "confirmError", "Passwords do not match.");
        return false;
    }

    clearError("confirm_password", "confirmError");
    return true;
}

function validateAddress() {
    var value = document.getElementById("address").value.trim();

    if (value === "") {
        showError("address", "addressError", "Address is required.");
        return false;
    }
    if (value.length < 10) {
        showError("address", "addressError", "Address must be at least 10 characters.");
        return false;
    }
    if (value.length > 250) {
        showError("address", "addressError", "Address must not exceed 250 characters.");
        return false;
    }

    clearError("address", "addressError");
    return true;
}

function validateTerms() {
    var checked = document.getElementById("terms").checked;
    var errorBox = document.getElementById("termsError");

    if (!checked) {
        errorBox.textContent = "You must accept the Terms & Conditions to register.";
        return false;
    }

    errorBox.textContent = "";
    return true;
}


// =============================================
// PASSWORD STRENGTH INDICATOR
// Counts how many rules the password satisfies
// Shows Weak / Medium / Strong
// =============================================

function updatePasswordStrength() {
    var value = document.getElementById("password").value;

    // 3 visual bar segments
    var segments = document.querySelectorAll(".strength-segment");
    var label    = document.getElementById("strengthText");

    // Count which rules are satisfied
    var score = 0;
    if (/[A-Z]/.test(value)) score++;   // has uppercase
    if (/[a-z]/.test(value)) score++;   // has lowercase
    if (/[0-9]/.test(value)) score++;   // has number
    if (/[^A-Za-z0-9]/.test(value)) score++; // has special char

    // Reset all segments to grey first
    segments[0].className = "strength-segment";
    segments[1].className = "strength-segment";
    segments[2].className = "strength-segment";
    label.textContent = "";
    label.className = "strength-text";

    // Nothing typed yet → leave bar empty
    if (value === "") return;

    if (score <= 2) {
        // WEAK: fill only first segment red
        segments[0].classList.add("seg-weak");
        label.textContent = "Weak";
        label.classList.add("label-weak");

    } else if (score === 3) {
        // MEDIUM: fill two segments orange
        segments[0].classList.add("seg-medium");
        segments[1].classList.add("seg-medium");
        label.textContent = "Medium";
        label.classList.add("label-medium");

    } else {
        // STRONG: fill all three segments green
        segments[0].classList.add("seg-strong");
        segments[1].classList.add("seg-strong");
        segments[2].classList.add("seg-strong");
        label.textContent = "Strong";
        label.classList.add("label-strong");
    }
}


// =============================================
// SHOW / HIDE PASSWORD TOGGLE
// =============================================

function setupToggle(buttonId, inputId) {
    var button = document.getElementById(buttonId);
    var input  = document.getElementById(inputId);

    button.addEventListener("click", function () {
        if (input.type === "password") {
            input.type = "text";       // show the password
            button.textContent = "Hide";
        } else {
            input.type = "password";   // hide the password
            button.textContent = "Show";
        }
    });
}


// =============================================
// RESET BUTTON: clear all validation styles
// =============================================

function resetValidation() {
    // Remove red/green borders from all inputs
    var inputs = document.querySelectorAll("input, textarea");
    inputs.forEach(function (el) {
        el.classList.remove("error", "valid");
    });

    // Clear all error messages
    var errors = document.querySelectorAll(".error-msg");
    errors.forEach(function (el) {
        el.textContent = "";
    });

    // Reset strength bar
    var segments = document.querySelectorAll(".strength-segment");
    segments.forEach(function (s) {
        s.className = "strength-segment";
    });
    var strengthText = document.getElementById("strengthText");
    if (strengthText) {
        strengthText.textContent = "";
        strengthText.className = "strength-text";
    }
}


// =============================================
// MAIN: runs when the page is fully loaded
// =============================================

document.addEventListener("DOMContentLoaded", function () {

    // --- Wire up live validation (checks when user leaves a field) ---
    document.getElementById("full_name").addEventListener("blur", validateFullName);
    document.getElementById("email").addEventListener("blur", validateEmail);
    document.getElementById("mobile").addEventListener("blur", validateMobile);
    document.getElementById("address").addEventListener("blur", validateAddress);
    document.getElementById("terms").addEventListener("change", validateTerms);

    // Password: validate + update strength bar while typing
    document.getElementById("password").addEventListener("input", function () {
        updatePasswordStrength();
        validatePassword();
        // Also re-check confirm password if it already has a value
        if (document.getElementById("confirm_password").value !== "") {
            validateConfirmPassword();
        }
    });

    // Confirm password: check match while typing
    document.getElementById("confirm_password").addEventListener("input", validateConfirmPassword);

    // --- Show / Hide toggles ---
    setupToggle("togglePw",     "password");
    setupToggle("toggleCpw",    "confirm_password");

    // --- Reset button ---
    document.getElementById("resetBtn").addEventListener("click", resetValidation);

    // --- Form submit ---
    document.getElementById("registerForm").addEventListener("submit", function (e) {

        // Run all validators and collect true/false results
        var results = [
            validateFullName(),
            validateEmail(),
            validateMobile(),
            validatePassword(),
            validateConfirmPassword(),
            validateAddress(),
            validateTerms()
        ];

        // Check if any validator returned false
        var hasError = results.includes(false);

        if (hasError) {
            e.preventDefault(); // STOP the form from submitting

            // Move focus to the first field with an error
            var firstError = document.querySelector("input.error, textarea.error");
            if (firstError) {
                firstError.focus();
            }

        } else {
            e.preventDefault(); // prevent form posting to register.php
            // All valid — for now show a message (PHP backend comes later)
            // All fields valid → go to WIP page
            // ?from=register tells wip.html to show "Go to Login" button
            window.location.href = "wip.html?from=register";
        }
    });
});
