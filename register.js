/**
 * register.js – Client-side validation for Smart Parking Registration
 *
 * Architecture:
 *   1. Each field has a validate* function that returns true/false
 *      and shows/clears the inline error message.
 *   2. On form submit, every field is validated; the first invalid
 *      field gets focus. Submission only proceeds when all pass.
 *   3. Live feedback is wired on input/blur events.
 */

"use strict";

// ── Regex constants ──────────────────────────────────────────────────────────
const RE_NAME   = /^[A-Za-z ]{3,100}$/;           // letters and spaces only
const RE_EMAIL  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // basic email shape
const RE_MOBILE = /^[6-9]\d{9}$/;                  // Indian 10-digit mobile

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Show an inline error on a field; mark it invalid. */
function showError(input, errorEl, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    errorEl.textContent = message;
}

/** Clear an inline error on a field; mark it valid. */
function clearError(input, errorEl) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    errorEl.textContent = "";
}

// ── Field validators (each returns true = valid) ─────────────────────────────

function validateFullName() {
    const input    = document.getElementById("full_name");
    const errorEl  = document.getElementById("fullNameError");
    const value    = input.value.trim();

    if (!value) {
        showError(input, errorEl, "Full name is required.");
        return false;
    }
    if (!RE_NAME.test(value)) {
        showError(input, errorEl, "Name must be 3–100 letters and spaces only.");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validateEmail() {
    const input    = document.getElementById("email");
    const errorEl  = document.getElementById("emailError");
    const value    = input.value.trim().toLowerCase();

    if (!value) {
        showError(input, errorEl, "Email address is required.");
        return false;
    }
    if (!RE_EMAIL.test(value)) {
        showError(input, errorEl, "Please enter a valid email address.");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validateMobile() {
    const input    = document.getElementById("mobile");
    const errorEl  = document.getElementById("mobileError");
    const value    = input.value.trim();

    if (!value) {
        showError(input, errorEl, "Mobile number is required.");
        return false;
    }
    if (!RE_MOBILE.test(value)) {
        showError(input, errorEl, "Enter a valid 10-digit Indian mobile number (starts with 6–9).");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validatePassword() {
    const input    = document.getElementById("password");
    const errorEl  = document.getElementById("passwordError");
    const value    = input.value;

    if (!value) {
        showError(input, errorEl, "Password is required.");
        return false;
    }
    if (value.length < 8) {
        showError(input, errorEl, "Password must be at least 8 characters.");
        return false;
    }
    if (value.length > 64) {
        showError(input, errorEl, "Password must not exceed 64 characters.");
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        showError(input, errorEl, "Password must contain at least one uppercase letter.");
        return false;
    }
    if (!/[a-z]/.test(value)) {
        showError(input, errorEl, "Password must contain at least one lowercase letter.");
        return false;
    }
    if (!/[0-9]/.test(value)) {
        showError(input, errorEl, "Password must contain at least one number.");
        return false;
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
        showError(input, errorEl, "Password must contain at least one special character.");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validateConfirmPassword() {
    const password = document.getElementById("password").value;
    const input    = document.getElementById("confirm_password");
    const errorEl  = document.getElementById("confirmPasswordError");

    if (!input.value) {
        showError(input, errorEl, "Please confirm your password.");
        return false;
    }
    if (input.value !== password) {
        showError(input, errorEl, "Passwords do not match.");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validateAddress() {
    const input    = document.getElementById("address");
    const errorEl  = document.getElementById("addressError");
    const value    = input.value.trim();

    if (!value) {
        showError(input, errorEl, "Address is required.");
        return false;
    }
    if (value.length < 10) {
        showError(input, errorEl, "Address must be at least 10 characters.");
        return false;
    }
    if (value.length > 250) {
        showError(input, errorEl, "Address must not exceed 250 characters.");
        return false;
    }
    clearError(input, errorEl);
    return true;
}

function validateTerms() {
    const checkbox = document.getElementById("terms");
    const errorEl  = document.getElementById("termsError");

    if (!checkbox.checked) {
        errorEl.textContent = "You must accept the Terms & Conditions.";
        return false;
    }
    errorEl.textContent = "";
    return true;
}

// ── Password strength indicator ───────────────────────────────────────────────
/**
 * Score: count how many of the four character-class criteria are met.
 * 0-1 → Weak, 2-3 → Medium, 4 → Strong
 */
function updateStrength() {
    const value     = document.getElementById("password").value;
    const segments  = document.querySelectorAll(".strength-segment");
    const label     = document.getElementById("strengthLabel");

    const checks = [
        /[A-Z]/.test(value),
        /[a-z]/.test(value),
        /[0-9]/.test(value),
        /[^A-Za-z0-9]/.test(value),
    ];
    const score = checks.filter(Boolean).length;

    // Reset all segments
    segments.forEach(s => s.className = "strength-segment");
    label.className = "strength-label";
    label.textContent = "";

    if (!value) return; // nothing typed – keep bar empty

    if (score <= 2) {
        // Weak: colour only first segment
        segments[0].classList.add("seg-weak");
        label.textContent = "Weak";
        label.classList.add("strength-weak");
    } else if (score === 3) {
        // Medium: colour first two segments
        segments[0].classList.add("seg-medium");
        segments[1].classList.add("seg-medium");
        label.textContent = "Medium";
        label.classList.add("strength-medium");
    } else {
        // Strong: colour all three segments
        segments.forEach(s => s.classList.add("seg-strong"));
        label.textContent = "Strong";
        label.classList.add("strength-strong");
    }
}

// ── Show / hide password toggle ───────────────────────────────────────────────
function setupToggle(btnId, inputId) {
    const btn   = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    btn.addEventListener("click", () => {
        const isText = input.type === "text";
        input.type   = isText ? "password" : "text";
        btn.textContent = isText ? "Show" : "Hide";
    });
}

// ── Live event wiring ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Live / blur validation per field
    document.getElementById("full_name").addEventListener("blur",  validateFullName);
    document.getElementById("email").addEventListener("blur",       validateEmail);
    document.getElementById("mobile").addEventListener("blur",      validateMobile);
    document.getElementById("password").addEventListener("input",   () => { updateStrength(); validatePassword(); validateConfirmPassword(); });
    document.getElementById("confirm_password").addEventListener("input", validateConfirmPassword);
    document.getElementById("address").addEventListener("blur",     validateAddress);
    document.getElementById("terms").addEventListener("change",     validateTerms);

    // Show/hide password toggles
    setupToggle("togglePassword",        "password");
    setupToggle("toggleConfirmPassword", "confirm_password");

    // Reset button clears validation state classes too
    document.getElementById("resetBtn").addEventListener("click", () => {
        document.querySelectorAll("input, textarea").forEach(el => {
            el.classList.remove("is-valid", "is-invalid");
        });
        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
        // Reset strength bar
        document.querySelectorAll(".strength-segment").forEach(s => s.className = "strength-segment");
        document.getElementById("strengthLabel").textContent = "";
        document.getElementById("strengthLabel").className   = "strength-label";
    });

    // ── Form submit ───────────────────────────────────────────────────────────
    document.getElementById("registerForm").addEventListener("submit", (e) => {
        // Run all validators and collect results
        const results = [
            validateFullName(),
            validateEmail(),
            validateMobile(),
            validatePassword(),
            validateConfirmPassword(),
            validateAddress(),
            validateTerms(),
        ];

        if (results.includes(false)) {
            e.preventDefault(); // block form from submitting to PHP

            // Focus the first invalid input
            const firstInvalid = document.querySelector(".is-invalid");
            if (firstInvalid) firstInvalid.focus();
        }
        // If all true → allow native POST to register.php for PHP validation
    });
});
