/**
 * Smart Parking System - Settings Controller
 * Loads lot config and rates from api/settings.php (PHP PDO / smart_parking_db).
 * Saves changes via POST.
 */

/* ── Guard: redirect to login if not authenticated ── */
(function () { if (!sessionStorage.getItem("sp_logged_in")) window.location.href = "login.html"; })();


/* ── Load current settings from API and pre-fill the form ── */
function loadSettings() {
    fetch("../php/api/settings.php")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && result.data) {
                fillForm(result.data);
            }
            // If no data, form defaults remain (as set in HTML)
        })
        .catch(function () {
            // API offline – form keeps its HTML default values
            showMsg("ℹ️ Could not reach the database. Showing default values.", false);
        });
}

/* ── Pre-fill form fields with data from the API ── */
function fillForm(data) {
    var lot   = data.lot   || {};
    var rates = data.rates || [];

    // Lot info fields
    if (lot.lot_name)      document.getElementById("setLotName").value      = lot.lot_name;
    if (lot.location)      document.getElementById("setLocation").value      = lot.location;
    if (lot.opening_time)  document.getElementById("setOpeningTime").value   = lot.opening_time.slice(0, 5); // HH:MM
    if (lot.closing_time)  document.getElementById("setClosingTime").value   = lot.closing_time.slice(0, 5);

    // Pricing rates – match vehicle_type from the rates array
    rates.forEach(function (r) {
        if (r.vehicle_type === "4-Wheeler Car")             document.getElementById("setCarRate").value  = r.rate;
        if (r.vehicle_type === "2-Wheeler Bike" || r.vehicle_type === "2-Wheeler Scooter") document.getElementById("setBikeRate").value = r.rate;
        if (r.vehicle_type === "EV Vehicle")                document.getElementById("setEvRate").value   = r.rate;
    });
}

/* ── Show a save / error banner below the heading ── */
function showMsg(text, isSuccess) {
    var msg = document.getElementById("settingsSaveMsg");
    msg.textContent = text;
    msg.style.display = "block";
    if (isSuccess) {
        msg.style.background = "#ecfdf5";
        msg.style.color      = "#065f46";
        msg.style.border     = "1px solid #a7f3d0";
    } else {
        msg.style.background = "#fff7ed";
        msg.style.color      = "#92400e";
        msg.style.border     = "1px solid #fcd34d";
    }
    // Auto-dismiss after 4 seconds
    setTimeout(function () { msg.style.display = "none"; }, 4000);
}

function loadUserHeader() {
    var name = sessionStorage.getItem("sp_user_name") || "Admin";
    var role = sessionStorage.getItem("sp_user_role") || "Super Admin";
    var initials = name.split(" ").map(function (w) { return w ? w[0] : ""; }).join("").toUpperCase().slice(0, 2) || "AD";
    var avatarEl = document.getElementById("userAvatar") || document.querySelector(".user-avatar");
    var nameEl   = document.getElementById("userName") || document.querySelector(".user-details .user-name");
    var roleEl   = document.getElementById("userRole") || document.querySelector(".user-details .user-role");
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = name;
    if (roleEl)   roleEl.textContent   = role;

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "1";
        logoutBtn.addEventListener("click", function () {
            sessionStorage.clear();
            window.location.href = "login.html";
        });
    }
}

/* ── DOM ready ── */
document.addEventListener("DOMContentLoaded", function () {
    loadUserHeader();
    loadSettings(); // Pre-fill form on page load

    // Reload button fetches fresh data from DB
    document.getElementById("refreshSettingsBtn").addEventListener("click", function () {
        loadSettings();
        showMsg("↺ Reloaded settings from smart_parking_db.", true);
    });

    // Save settings form submit
    document.getElementById("settingsForm").addEventListener("submit", function (e) {
        e.preventDefault();

        var payload = {
            lot_name:     document.getElementById("setLotName").value.trim(),
            location:     document.getElementById("setLocation").value.trim(),
            opening_time: document.getElementById("setOpeningTime").value + ":00", // Add seconds for TIME column
            closing_time: document.getElementById("setClosingTime").value + ":00",
            car_rate:     parseFloat(document.getElementById("setCarRate").value)  || 40,
            bike_rate:    parseFloat(document.getElementById("setBikeRate").value) || 20,
            ev_rate:      parseFloat(document.getElementById("setEvRate").value)   || 60
        };

        // POST to PHP API (PDO updates parking_lots + parking_slots tables)
        fetch("../php/api/settings.php", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload)
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            showMsg(result.message || "Settings saved.", result.success);
        })
        .catch(function () {
            // Offline – just show a friendly message; nothing is persisted without DB
            showMsg("✅ Settings noted (demo mode – no live DB connection).", true);
        });
    });

    // Live clock in the header
    function updateClock() {
        var now = new Date();
        document.getElementById("headerDate").textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("headerTime").textContent = now.toLocaleTimeString("en-IN");
    }
    updateClock();
    setInterval(updateClock, 1000);
});
