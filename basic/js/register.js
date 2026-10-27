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

        var firstError = document.querySelector(
            "input.error, textarea.error"
        );

        if (firstError) {
            firstError.focus();
        }
    }
});