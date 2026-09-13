/**
 * Smart Parking System - Login Page Controller
 * POSTs credentials to php/login.php (PHP PDO + sessions).
 * Only redirects to dashboard.html after server confirms auth success.
 */

var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Field-level validation helpers ── */
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("error");
    document.getElementById(inputId).classList.remove("valid");
    document.getElementById(errorId).textContent = message;
}

function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove("error");
    document.getElementById(inputId).classList.add("valid");
    document.getElementById(errorId).textContent = "";
}

function validateEmail() {
    var value = document.getElementById("email").value.trim();
    if (!value) { showError("email", "emailError", "Email is required."); return false; }
    if (!EMAIL_PATTERN.test(value)) { showError("email", "emailError", "Enter a valid email."); return false; }
    clearError("email", "emailError"); return true;
}

function validatePassword() {
    var value = document.getElementById("password").value;
    if (!value) { showError("password", "passwordError", "Password is required."); return false; }
    if (value.length < 6) { showError("password", "passwordError", "Minimum 6 characters."); return false; }
    clearError("password", "passwordError"); return true;
}

document.addEventListener("DOMContentLoaded", function () {
    var emailInput    = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var submitBtn     = document.getElementById("loginSubmitBtn");
    var serverError   = document.getElementById("serverError");

    /* Live validation on blur / keystroke */
    emailInput.addEventListener("blur",  validateEmail);
    emailInput.addEventListener("input", function () { if (emailInput.classList.contains("error")) validateEmail(); });

    passwordInput.addEventListener("blur",  validatePassword);
    passwordInput.addEventListener("input", function () { if (passwordInput.classList.contains("error")) validatePassword(); });

    /* Show / hide password toggle */
    document.getElementById("togglePw").addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            this.textContent = "Show";
        }
    });

    /* Pre-fill default admin credentials hint from URL (only shown on ?hint=1) */
    var params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1" && serverError) {
        serverError.style.color  = "#065f46";
        serverError.style.background = "#ecfdf5";
        serverError.style.border = "1px solid #a7f3d0";
        serverError.textContent  = "✅ Account created! Please login.";
        serverError.style.display = "block";
    }

    /* Form submit — POST to PHP API, handle response */
    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();

        if (!validateEmail() | !validatePassword()) return; // short-circuit client validation

        var email    = emailInput.value.trim();
        var password = passwordInput.value;

        // Disable button during request to prevent double-submit
        submitBtn.disabled   = true;
        submitBtn.textContent = "Logging in...";
        if (serverError) serverError.style.display = "none";

        // Build form data — login.php reads $_POST
        var formData = new FormData();
        formData.append("email",    email);
        formData.append("password", password);

        fetch("../php/login.php", {
            method: "POST",
            headers: { "Accept": "application/json" },
            body:   formData
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success) {
                // Store minimal session info in sessionStorage for header display
                sessionStorage.setItem("sp_logged_in", "1");
                sessionStorage.setItem("sp_user_name", result.user_name || "Admin");
                sessionStorage.setItem("sp_user_role", result.user_role || "Super Admin");
                // Redirect to dashboard
                window.location.href = result.redirect || "dashboard.html";
            } else {
                // Show server error message
                if (serverError) {
                    serverError.textContent  = result.message || "Invalid email or password.";
                    serverError.style.display = "block";
                }
                submitBtn.disabled   = false;
                submitBtn.textContent = "Login";
            }
        })
        .catch(function (err) {
            if (serverError) {
                serverError.textContent  = "⚠️ Server communication error. Make sure WAMP Apache/MySQL is running.";
                serverError.style.display = "block";
            }
            submitBtn.disabled   = false;
            submitBtn.textContent = "Login";
        });
    });
});
