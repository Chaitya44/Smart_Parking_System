var NAME_PATTERN = /^[A-Za-z ]{3,100}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MOBILE_PATTERN = /^[6-9]\d{9}$/;

function showError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorBox = document.getElementById(errorId);

    input.classList.remove("valid");
    input.classList.add("error");

    errorBox.textContent = message;
}

function clearError(inputId, errorId) {
    var input = document.getElementById(inputId);
    var errorBox = document.getElementById(errorId);

    input.classList.remove("error");
    input.classList.add("valid");

    errorBox.textContent = "";
}

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
    var confirm = document.getElementById("confirm_password").value;

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

function updatePasswordStrength() {
    var value = document.getElementById("password").value;
    var segments = document.querySelectorAll(".strength-segment");
    var label = document.getElementById("strengthText");

    var score = 0;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    segments[0].className = "strength-segment";
    segments[1].className = "strength-segment";
    segments[2].className = "strength-segment";
    label.textContent = "";
    label.className = "strength-text";

    if (value === "") return;

    if (score <= 2) {
        segments[0].classList.add("seg-weak");
        label.textContent = "Weak";
        label.classList.add("label-weak");
    } else if (score === 3) {
        segments[0].classList.add("seg-medium");
        segments[1].classList.add("seg-medium");
        label.textContent = "Medium";
        label.classList.add("label-medium");
    } else {
        segments[0].classList.add("seg-strong");
        segments[1].classList.add("seg-strong");
        segments[2].classList.add("seg-strong");
        label.textContent = "Strong";
        label.classList.add("label-strong");
    }
}

function setupToggle(buttonId, inputId) {
    var button = document.getElementById(buttonId);
    var input = document.getElementById(inputId);

    button.addEventListener("click", function () {
        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
}

function resetValidation() {
    var inputs = document.querySelectorAll("input, textarea");
    inputs.forEach(function (el) {
        el.classList.remove("error", "valid");
    });

    var errors = document.querySelectorAll(".error-msg");
    errors.forEach(function (el) {
        el.textContent = "";
    });

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

document.addEventListener("DOMContentLoaded", function () {

    var nameInput = document.getElementById("full_name");
    var emailInput = document.getElementById("email");
    var mobileInput = document.getElementById("mobile");
    var addressInput = document.getElementById("address");

    nameInput.addEventListener("blur", validateFullName);
    nameInput.addEventListener("input", function () {
        if (nameInput.classList.contains("error")) validateFullName();
    });

    emailInput.addEventListener("blur", validateEmail);
    emailInput.addEventListener("input", function () {
        if (emailInput.classList.contains("error")) validateEmail();
    });

    mobileInput.addEventListener("blur", validateMobile);
    mobileInput.addEventListener("input", function () {
        if (mobileInput.classList.contains("error")) validateMobile();
    });

    addressInput.addEventListener("blur", validateAddress);
    addressInput.addEventListener("input", function () {
        if (addressInput.classList.contains("error")) validateAddress();
    });

    document.getElementById("terms").addEventListener("change", validateTerms);

    document.getElementById("password").addEventListener("input", function () {
        updatePasswordStrength();
        validatePassword();
        if (document.getElementById("confirm_password").value !== "") {
            validateConfirmPassword();
        }
    });

    document.getElementById("confirm_password").addEventListener("input", validateConfirmPassword);

    setupToggle("togglePw", "password");
    setupToggle("toggleCpw", "confirm_password");

    document.getElementById("resetBtn").addEventListener("click", resetValidation);

    document.getElementById("registerForm").addEventListener("submit", function (e) {
        var results = [
            validateFullName(),
            validateEmail(),
            validateMobile(),
            validatePassword(),
            validateConfirmPassword(),
            validateAddress(),
            validateTerms()
        ];

        var hasError = results.includes(false);

        if (hasError) {
            e.preventDefault();
            var firstError = document.querySelector("input.error, textarea.error");
            if (firstError) {
                firstError.focus();
            }
        } else {
            e.preventDefault();
            window.location.href = "wip.html?from=register";
        }
    });
});
