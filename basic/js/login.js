var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(inputId, errorId, message) {
    var el = document.getElementById(inputId);
    el.classList.remove("valid");
    el.classList.add("error");
    document.getElementById(errorId).textContent = message;
}

function clearError(inputId, errorId) {
    var el = document.getElementById(inputId);
    el.classList.remove("error");
    el.classList.add("valid");
    document.getElementById(errorId).textContent = "";
}

function validateEmail() {
    var value = document.getElementById("email").value.trim();
    if (value === "") {
        showError("email", "emailError", "Email address is required.");
        return false;
    }
    if (!EMAIL_PATTERN.test(value)) {
        showError("email", "emailError", "Please enter a valid email address.");
        return false;
    }
    clearError("email", "emailError");
    return true;
}

function validatePassword() {
    var value = document.getElementById("password").value;
    if (value === "") {
        showError("password", "passwordError", "Password is required.");
        return false;
    }
    if (value.length < 6) {
        showError("password", "passwordError", "Password must be at least 6 characters.");
        return false;
    }
    clearError("password", "passwordError");
    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");

    emailInput.addEventListener("blur", validateEmail);
    emailInput.addEventListener("input", function () {
        if (emailInput.classList.contains("error")) {
            validateEmail();
        }
    });

    passwordInput.addEventListener("blur", validatePassword);
    passwordInput.addEventListener("input", function () {
        if (passwordInput.classList.contains("error")) {
            validatePassword();
        }
    });

    document.getElementById("togglePw").addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            this.textContent = "Show";
        }
    });

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        var vEmail = validateEmail();
        var vPass = validatePassword();
        var ok = vEmail && vPass;
        if (!ok) {
            e.preventDefault();
            var first = document.querySelector("input.error");
            if (first) first.focus();
        } else {
            e.preventDefault();
            window.location.href = "dashboard.html";
        }
    });
});
