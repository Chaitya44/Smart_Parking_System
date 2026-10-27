/**
 * Smart Parking System - Reports & Analytics Controller
 * Fetches aggregated stats from api/reports.php (PHP PDO / smart_parking_db).
 */

/* ── Guard: redirect to login or dashboard if not admin ── */
(function () {
    if (!sessionStorage.getItem("sp_logged_in")) { window.location.href = "login.html"; return; }
    var role = (sessionStorage.getItem("sp_user_role") || "").trim().toLowerCase();
    var isUser = (role === "customer" || role === "user" || (!role.includes("admin") && !role.includes("operator") && !role.includes("manager") && !role.includes("staff")));
    if (isUser) { window.location.href = "dashboard.html"; }
})();

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

/* ── Revenue by vehicle type table with visual progress bar ── */
function renderVehicleTypeTable(rows) {
    var tbody = document.getElementById("vehicleTypeReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr class='report-empty-row'><td colspan='4'><div class='report-empty-content'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='12' x='3' y='6' rx='2'/><path d='M7 14h.01'/><path d='M17 14h.01'/></svg><div class='empty-title'>No vehicle revenue records yet</div><div class='empty-sub'>Vehicle breakdowns will appear once bookings are billed.</div></div></td></tr>";
        return;
    }

    var maxAmount = Math.max.apply(null, rows.map(function (r) { return parseFloat(r.total_amount); }));

    rows.forEach(function (r) {
        var pct = maxAmount > 0 ? (parseFloat(r.total_amount) / maxAmount * 100).toFixed(1) : 0;
        var tr  = document.createElement("tr");
        tr.innerHTML =
            "<td><strong>" + r.vehicle_type + "</strong></td>" +
            "<td>" + r.total_bills + " sessions</td>" +
            "<td style='font-weight:800;color:#047857;'>₹" + parseFloat(r.total_amount).toFixed(2) + "</td>" +
            "<td>" +
                "<div class='report-bar-wrap'>" +
                    "<div class='report-bar-track'>" +
                        "<div class='report-bar-fill' style='background:#10b981;width:" + pct + "%;'></div>" +
                    "</div>" +
                    "<span class='report-bar-pct'>" + pct + "%</span>" +
                "</div>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Zone performance table ── */
function renderZoneTable(rows) {
    var tbody = document.getElementById("zoneReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr class='report-empty-row'><td colspan='4'><div class='report-empty-content'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M3 9h18'/><path d='M9 21V9'/></svg><div class='empty-title'>No zone revenue data yet</div><div class='empty-sub'>Floor and zone metrics update after parking checkout.</div></div></td></tr>";
        return;
    }

    var maxRev = Math.max.apply(null, rows.map(function (r) { return parseFloat(r.zone_revenue); }));

    rows.forEach(function (r) {
        var pct = maxRev > 0 ? (parseFloat(r.zone_revenue) / maxRev * 100).toFixed(1) : 0;
        var tr  = document.createElement("tr");
        tr.innerHTML =
            "<td><strong>" + r.zone_name + "</strong></td>" +
            "<td>" + r.total_sessions + " sessions</td>" +
            "<td style='font-weight:800;color:#047857;'>₹" + parseFloat(r.zone_revenue).toFixed(2) + "</td>" +
            "<td>" +
                "<div class='report-bar-wrap'>" +
                    "<div class='report-bar-track'>" +
                        "<div class='report-bar-fill' style='background:#3b82f6;width:" + pct + "%;'></div>" +
                    "</div>" +
                    "<span class='report-bar-pct'>" + pct + "%</span>" +
                "</div>" +
            "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Payment mode breakdown table ── */
function renderPaymentModeTable(rows) {
    var tbody = document.getElementById("paymentModeReportTable");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = "<tr class='report-empty-row'><td colspan='4'><div class='report-empty-content'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='14' x='2' y='5' rx='2'/><line x1='2' x2='22' y1='10' y2='10'/></svg><div class='empty-title'>No payment transactions yet</div><div class='empty-sub'>Cash, UPI, and Card receipts will populate automatically.</div></div></td></tr>";
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
            "<td>" +
                "<div class='report-bar-wrap'>" +
                    "<div class='report-bar-track'>" +
                        "<div class='report-bar-fill' style='background:" + color + ";width:" + pct + "%;'></div>" +
                    "</div>" +
                    "<span class='report-bar-pct'>" + pct + "%</span>" +
                "</div>" +
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

    var refreshBtn = document.getElementById("refreshReportsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            refreshBtn.disabled = true;
            fetchReports();
            setTimeout(function () {
                refreshBtn.disabled = false;
            }, 600);
        });
    }

    // Live clock in the header
    function updateClock() {
        var now = new Date();
        document.getElementById("headerDate").textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("headerTime").textContent = now.toLocaleTimeString("en-IN");
    }
    updateClock();
    setInterval(updateClock, 1000);
});
