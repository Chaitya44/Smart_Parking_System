// =============================================
//   Smart Parking System - Login Validation
//   File: login.js
// =============================================

var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("error");
    document.getElementById(errorId).textContent = message;
}

function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove("error");
    document.getElementById(errorId).textContent = "";
}

function validateEmail() {
    var value = document.getElementById("email").value.trim();
    if (value === "") { showError("email", "emailError", "Email is required."); return false; }
    if (!EMAIL_PATTERN.test(value)) { showError("email", "emailError", "Enter a valid email address."); return false; }
    clearError("email", "emailError");
    return true;
}

function validatePassword() {
    var value = document.getElementById("password").value;
    if (value === "") { showError("password", "passwordError", "Password is required."); return false; }
    clearError("password", "passwordError");
    return true;
}

document.addEventListener("DOMContentLoaded", function () {

    // Live validation on blur
    document.getElementById("email").addEventListener("blur", validateEmail);
    document.getElementById("password").addEventListener("blur", validatePassword);

    // Show/Hide password toggle
    document.getElementById("togglePw").addEventListener("click", function () {
        var input = document.getElementById("password");
        if (input.type === "password") {
            input.type = "text";
            this.textContent = "Hide";
        } else {
            input.type = "password";
            this.textContent = "Show";
        }
    });

    // Form submit
    document.getElementById("loginForm").addEventListener("submit", function (e) {
        var ok = validateEmail() & validatePassword(); // run both (no short-circuit)
        if (!ok) {
            e.preventDefault();
            var first = document.querySelector("input.error");
            if (first) first.focus();
        } else {
            e.preventDefault(); // prevent form posting to login.php
            // ?from=login tells wip.html to explain that DB is required
            window.location.href = "wip.html?from=login";
        }
    });
});
