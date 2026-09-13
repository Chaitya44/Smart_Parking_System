/**
 * Smart Parking System - Vehicles Controller
 * All data comes from api/vehicles.php (PHP PDO / smart_parking_db).
 */

/* ── Guard: redirect to login if not authenticated ── */
(function () { if (!sessionStorage.getItem("sp_logged_in")) window.location.href = "login.html"; })();

/* ── Fetch from API ── */
function fetchVehicles() {
    var search = document.getElementById("vehicleSearchInput").value.trim();
    var type   = document.getElementById("vehicleTypeFilter").value;

    fetch("../php/api/vehicles.php?search=" + encodeURIComponent(search) + "&type=" + encodeURIComponent(type))
        .then(function (res) { return res.json(); })
        .then(function (result) {
            renderVehiclesTable(result.success && Array.isArray(result.data) ? result.data : []);
        })
        .catch(function () { renderVehiclesTable([]); });
}

/* ── Render vehicles into the table ── */
function renderVehiclesTable(data) {
    var tbody = document.getElementById("vehiclesTableBody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='9' style='text-align:center;color:#64748b;padding:28px;'>No vehicles found. Register one to get started.</td></tr>";
        return;
    }

    data.forEach(function (v) {
        var isParked = v.booking_status === "ACTIVE" && v.slot_number;

        var statusBadge = isParked
            ? "<span class='tbl-badge tbl-badge-active'>Parked</span>"
            : "<span class='tbl-badge' style='background:#f1f5f9;color:#64748b;'>Off-site</span>";

        var slotInfo = isParked
            ? "<strong style='color:#047857;'>" + v.slot_number + "</strong>"
            : "<span style='color:#94a3b8;'>—</span>";

        var brandText = ((v.brand || "") + " " + (v.model || "")).trim() || "—";

        var actionBtn = isParked
            ? "<a href='dashboard.html' class='btn btn-secondary btn-sm'>View Dashboard</a>"
            : "<a href='dashboard.html' class='btn btn-primary btn-sm'>Park Now</a>";

        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td><code style='font-weight:bold;font-size:0.85rem;'>" + v.vehicle_number + "</code></td>" +
            "<td>" + v.vehicle_type + "</td>" +
            "<td>" + brandText + "</td>" +
            "<td>" + (v.color || "—") + "</td>" +
            "<td><strong>" + (v.owner_name || "Guest") + "</strong></td>" +
            "<td>" + (v.owner_phone || "—") + "</td>" +
            "<td>" + statusBadge + "</td>" +
            "<td>" + slotInfo + "</td>" +
            "<td>" + actionBtn + "</td>";
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
    fetchVehicles();

    document.getElementById("vehicleSearchInput").addEventListener("input",  fetchVehicles);
    document.getElementById("vehicleTypeFilter").addEventListener("change",  fetchVehicles);

    var modal     = document.getElementById("addVehicleModal");
    var openBtn   = document.getElementById("openAddVehicleBtn");
    var closeBtn  = document.getElementById("closeAddVehicleModalBtn");
    var cancelBtn = document.getElementById("cancelAddVehicleBtn");
    var form      = document.getElementById("addVehicleForm");

    openBtn.addEventListener("click", function () { form.reset(); modal.classList.remove("hidden"); document.getElementById("newVehNumber").focus(); });
    function closeAddModal() { modal.classList.add("hidden"); }
    closeBtn.addEventListener("click",  closeAddModal);
    cancelBtn.addEventListener("click", closeAddModal);
    modal.addEventListener("click",     function (e) { if (e.target === modal) closeAddModal(); });

    // POST new vehicle to api/vehicles.php
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var vNo    = document.getElementById("newVehNumber").value.trim().toUpperCase();
        var vType  = document.getElementById("newVehType").value;
        var vBrand = document.getElementById("newVehBrand").value.trim();
        var vColor = document.getElementById("newVehColor").value.trim();
        var oName  = document.getElementById("newOwnerName").value.trim();
        var oPhone = document.getElementById("newOwnerPhone").value.trim();

        if (!vNo || !oName || !oPhone) { alert("Plate number, owner name, and phone are required."); return; }

        fetch("../php/api/vehicles.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicle_number: vNo, vehicle_type: vType, brand: vBrand, color: vColor, owner_name: oName, owner_phone: oPhone })
        })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            alert(res.message || (res.success ? "Vehicle registered." : "Error."));
            if (res.success) { closeAddModal(); fetchVehicles(); }
        })
        .catch(function () { alert("Network error. Is WAMP running?"); });
    });

    // Clock
    function tick() {
        var now = new Date();
        var d = document.getElementById("headerDate"); var t = document.getElementById("headerTime");
        if (d) d.textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        if (t) t.textContent = now.toLocaleTimeString("en-IN");
    }
    tick(); setInterval(tick, 1000);
});
