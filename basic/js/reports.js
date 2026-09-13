/**
 * Smart Parking System - Reports & Analytics Controller
 * Fetches aggregated stats from api/reports.php (PHP PDO / smart_parking_db).
 */

/* ── Guard: redirect to login if not authenticated ── */
(function () { if (!sessionStorage.getItem("sp_logged_in")) window.location.href = "login.html"; })();

var emptyReports = {
    summary: { total_slots: 18, currently_occupied: 0, all_time_bookings: 0, all_time_revenue: 0 },
    revenueByVehicleType: [],
    revenueByZone: [],
    paymentModeShare: []
};

/* ── Fetch from API ── */
function fetchReports() {
    fetch("../php/api/reports.php")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && result.data) {
                renderReports(result.data);
            } else {
                renderReports(emptyReports);
            }
        })
        .catch(function () {
            renderReports(emptyReports);
        });
}

/* ── Main render function: fills all four sections ── */
function renderReports(data) {
    renderSummaryCards(data.summary);
    renderVehicleTypeTable(data.revenueByVehicleType);
    renderZoneTable(data.revenueByZone);
    renderPaymentModeTable(data.paymentModeShare);
}

/* ── Fill the four KPI cards at the top ── */
function renderSummaryCards(s) {
    document.getElementById("rptTotalSlots").textContent = s.total_slots          || "0";
    document.getElementById("rptOccupied").textContent   = s.currently_occupied   || "0";
    document.getElementById("rptBookings").textContent   = s.all_time_bookings    || "0";
    document.getElementById("rptRevenue").textContent    = "₹" + parseFloat(s.all_time_revenue || 0).toFixed(2);
}

/* ── Revenue by vehicle type table with a simple CSS bar ── */
function renderVehicleTypeTable(rows) {
    var tbody = document.getElementById("vehicleTypeReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#64748b;padding:24px;'>No data yet.</td></tr>";
        return;
    }

    // Find max revenue to scale the visual bar proportionally
    var maxAmount = Math.max.apply(null, rows.map(function (r) { return parseFloat(r.total_amount); }));

    rows.forEach(function (r) {
        var pct = maxAmount > 0 ? (parseFloat(r.total_amount) / maxAmount * 100).toFixed(1) : 0;
        var tr  = document.createElement("tr");
        tr.innerHTML =
            "<td><strong>" + r.vehicle_type + "</strong></td>" +
            "<td>" + r.total_bills + " sessions</td>" +
            "<td style='font-weight:800;color:#047857;'>₹" + parseFloat(r.total_amount).toFixed(2) + "</td>" +
            "<td style='min-width:140px;'>" +
                "<div style='background:#e2e8f0;border-radius:6px;height:10px;'>" +
                    "<div style='background:#10b981;height:10px;border-radius:6px;width:" + pct + "%;transition:width 0.5s;'></div>" +
                "</div>" +
                "<small style='color:#64748b;'>" + pct + "%</small>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Zone performance table ── */
function renderZoneTable(rows) {
    var tbody = document.getElementById("zoneReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#64748b;padding:24px;'>No data yet.</td></tr>";
        return;
    }

    var maxRev = Math.max.apply(null, rows.map(function (r) { return parseFloat(r.zone_revenue); }));

    rows.forEach(function (r) {
        var pct = maxRev > 0 ? (parseFloat(r.zone_revenue) / maxRev * 100).toFixed(1) : 0;
        var tr  = document.createElement("tr");
        tr.innerHTML =
            "<td><strong>" + r.zone_name + "</strong></td>" +
            "<td>" + r.total_sessions + "</td>" +
            "<td style='font-weight:800;color:#047857;'>₹" + parseFloat(r.zone_revenue).toFixed(2) + "</td>" +
            "<td style='min-width:140px;'>" +
                "<div style='background:#e2e8f0;border-radius:6px;height:10px;'>" +
                    "<div style='background:#3b82f6;height:10px;border-radius:6px;width:" + pct + "%;transition:width 0.5s;'></div>" +
                "</div>" +
                "<small style='color:#64748b;'>" + pct + "%</small>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Payment mode breakdown table ── */
function renderPaymentModeTable(rows) {
    var tbody = document.getElementById("paymentModeReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#64748b;padding:24px;'>No data yet.</td></tr>";
        return;
    }

    var maxAmt = Math.max.apply(null, rows.map(function (r) { return parseFloat(r.amount); }));

    // Colour map for payment modes
    var colours = { CASH: "#10b981", UPI: "#8b5cf6", CARD: "#3b82f6" };

    rows.forEach(function (r) {
        var pct   = maxAmt > 0 ? (parseFloat(r.amount) / maxAmt * 100).toFixed(1) : 0;
        var color = colours[r.payment_mode] || "#64748b";
        var tr    = document.createElement("tr");
        tr.innerHTML =
            "<td><strong>" + r.payment_mode + "</strong></td>" +
            "<td>" + r.count + " transactions</td>" +
            "<td style='font-weight:800;color:#047857;'>₹" + parseFloat(r.amount).toFixed(2) + "</td>" +
            "<td style='min-width:140px;'>" +
                "<div style='background:#e2e8f0;border-radius:6px;height:10px;'>" +
                    "<div style='background:" + color + ";height:10px;border-radius:6px;width:" + pct + "%;transition:width 0.5s;'></div>" +
                "</div>" +
                "<small style='color:#64748b;'>" + pct + "%</small>" +
            "</td>";
        tbody.appendChild(tr);
    });
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
    fetchReports();

    // Live clock in the header
    function updateClock() {
        var now = new Date();
        document.getElementById("headerDate").textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("headerTime").textContent = now.toLocaleTimeString("en-IN");
    }
    updateClock();
    setInterval(updateClock, 1000);
});
