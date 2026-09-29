/**
 * Smart Parking System - Dashboard Controller
 * All data comes from PHP PDO API (smart_parking_db).
 * No localStorage, no demo/seed data.
 */

/* ── Runtime state loaded from API ── */
var slots = [];   // Live slot data from api/slots.php
var activeCheckoutSlot = null; // Slot currently being checked out

/* ── Guard: redirect to login if not authenticated ── */
(function authGuard() {
    if (!sessionStorage.getItem("sp_logged_in")) {
        window.location.href = "login.html";
    }
})();

/* ── Clock shown in the top header ── */
function updateClock() {
    var now  = new Date();
    var d    = document.getElementById("headerDate");
    var t    = document.getElementById("headerTime");
    if (d) d.textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    if (t) t.textContent = now.toLocaleTimeString("en-IN");
}

/* ── Inject logged-in user name & role into header ── */
function loadUserHeader() {
    var name = sessionStorage.getItem("sp_user_name") || "Admin";
    var role = sessionStorage.getItem("sp_user_role") || "Super Admin";
    var initials = name.split(" ").map(function (w) { return w ? w[0] : ""; }).join("").toUpperCase().slice(0, 2) || "AD";
    
    var avatarEl = document.getElementById("userAvatar") || document.querySelector(".user-avatar");
    var nameEl   = document.getElementById("userName") || document.querySelector(".user-details .user-name");
    var roleEl   = document.getElementById("userRole") || document.querySelector(".user-details .user-role");
    var welcomeHeading = document.getElementById("welcomeHeading") || document.querySelector(".welcome-heading");

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = name;
    if (roleEl)   roleEl.textContent   = role;
    if (welcomeHeading) {
        var hour = new Date().getHours();
        var greeting = hour < 12 ? "Good Morning" : (hour < 17 ? "Good Afternoon" : "Good Evening");
        welcomeHeading.innerHTML = greeting + ", " + name + ' <span class="wave-emoji">👋</span>';
    }
}

/* ── Modal helpers ── */
function openModal(id)  { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

/* ── Fetch ALL slots from API and re-render ── */
function fetchSlots() {
    var zoneVal   = document.getElementById("zoneFilter").value;
    var statusVal = document.getElementById("statusFilter").value;
    var evVal     = document.getElementById("evFilter").value;
    var search    = document.getElementById("slotSearchInput").value.trim();

    var url = "../php/api/slots.php?zone=" + encodeURIComponent(zoneVal) +
              "&status=" + encodeURIComponent(statusVal) +
              "&ev=" + encodeURIComponent(evVal) +
              "&search=" + encodeURIComponent(search);

    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && Array.isArray(result.data)) {
                slots = result.data;
                renderDashboard();
            }
        })
        .catch(function () {
            showToast("⚠️ Could not load slots. Is WAMP running?", "error");
        });
}

/* ── Fetch KPI stats from api/stats.php ── */
function fetchStats() {
    fetch("../php/api/stats.php")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && result.data) {
                var d = result.data;
                setText("statTotalSlots",    d.total     || 0);
                setText("statAvailableSlots",d.available || 0);
                setText("statOccupiedSlots", d.occupied  || 0);
                setText("statReservedSlots", d.reserved  || 0);
                setText("statRevenue",       "₹" + (d.revenue || 0));
                setText("statVehiclesIn",    d.vehiclesIn  || 0);
                setText("statVehiclesOut",   d.vehiclesOut || 0);
            }
        })
        .catch(function () { /* stats missing, not critical */ });
}

/* ── Fetch recent activity logs from api/slots.php?mode=logs ── */
function fetchLogs() {
    fetch("../php/api/slots.php?mode=logs")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && Array.isArray(result.data)) {
                renderLogsTable(result.data);
            }
        })
        .catch(function () { /* non-critical */ });
}

/* ── Helper: safely set element text ── */
function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ── Render the main slot grid and activity table ── */
function renderDashboard() {
    renderSlotsGrid(slots);
    populateAvailableSlotDropdown(slots);
    highlightFilterPill();
    fetchStats(); // Refresh KPI numbers from DB each render
    fetchLogs();  // Refresh activity log
}

/* ── Highlight the hero stat card matching the active status filter ── */
function highlightFilterPill() {
    var statusVal = document.getElementById("statusFilter").value;
    document.querySelectorAll(".hero-stat-card").forEach(function (card) {
        card.classList.toggle("active-stat", card.getAttribute("data-status") === statusVal);
    });
}

/* ── Render parking slot cards into the grid ── */
function renderSlotsGrid(data) {
    var grid = document.getElementById("slotsGrid");
    grid.innerHTML = "";

    // Zone progress bar
    var usedCount = data.filter(function (s) { return s.status === "OCCUPIED" || s.status === "RESERVED"; }).length;
    var ratioEl = document.getElementById("zoneSlotsRatio");
    var fillEl  = document.getElementById("zoneProgressFill");
    if (ratioEl) ratioEl.textContent = usedCount + " / " + data.length + " slots";
    if (fillEl)  fillEl.style.width  = (data.length > 0 ? Math.round((usedCount / data.length) * 100) : 0) + "%";

    if (data.length === 0) {
        grid.innerHTML = "<p style='color:#64748b;padding:24px;grid-column:1/-1;text-align:center;'>No slots match the current filter.</p>";
        return;
    }

    data.forEach(function (slot) {
        var card = document.createElement("div");
        var slotNum   = slot.slot_number || slot.id || "—";
        var vType     = slot.vehicle_type || slot.type || "—";
        var rate      = (slot.hourly_rate !== undefined ? slot.hourly_rate : slot.rate) || 0;
        var hasEV     = slot.hasEV || slot.has_ev || false;
        var vehNo     = slot.vehicle_number || slot.vehicleNo || "";
        var driver    = slot.driver_name || slot.driver || "";
        var entryTime = slot.entry_time || slot.entryTime || "";
        var status    = (slot.status || "AVAILABLE").toUpperCase();

        var isEV = hasEV ? " ev-slot" : "";
        card.className = "slot-card " + status.toLowerCase() + isEV;

        var iconHtml = "";
        var squareClass = "";
        var badgeHtml = "";
        var middleHtml = "";
        var actionHtml = "";

        var evBadgeHtml = hasEV ? '<span class="card-ev-badge"><span class="ev-bolt">⚡</span> EV</span>' : '';

        if (status === "OCCUPIED") {
            squareClass = "square-occupied";
            iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
            badgeHtml = '<span class="card-status-badge badge-occ"><span class="status-dot dot-occ"></span> Occupied</span>';
            middleHtml = '<div class="card-middle-content occ-content">' +
                '<div class="plate-row">' + (vehNo || "—") + '</div>' +
                '<div class="driver-row">' +
                    '<svg class="driver-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                    '<span>' + (driver || "Driver") + (entryTime ? ' • ' + (entryTime.length > 8 ? entryTime.slice(-8) : entryTime) : '') + '</span>' +
                '</div>' +
            '</div>';
            actionHtml = '<button type="button" class="card-action-btn btn-occ-action" onclick="openCheckoutModal(\'' + slotNum + '\')">' +
                '<div class="btn-left">' +
                    '<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>' +
                    '<span>Checkout</span>' +
                '</div>' +
                '<span class="btn-arrow">→</span>' +
            '</button>';
        } else if (status === "RESERVED") {
            squareClass = "square-reserved";
            iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>';
            badgeHtml = '<span class="card-status-badge badge-res"><span class="res-crown">👑</span> Reserved</span>';
            middleHtml = '<div class="card-middle-content res-content">' +
                '<div class="vip-name">Reserved Space</div>' +
                '<div class="res-subtext">VIP / Permit Holder</div>' +
            '</div>';
            actionHtml = '<div class="card-action-btn btn-res-action"><span>Reserved</span></div>';
        } else {
            squareClass = "square-available";
            iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
            badgeHtml = '<span class="card-status-badge badge-avail"><span class="status-dot dot-avail"></span> Available</span>';
            middleHtml = '<div class="card-middle-content avail-content">' +
                '<div class="vacant-subtext">Ready for Check-in</div>' +
            '</div>';
            actionHtml = '<button type="button" class="card-action-btn btn-avail-action" onclick="openParkModal(\'' + slotNum + '\')">' +
                '<div class="btn-left"><span class="btn-plus">+</span><span>Park Vehicle</span></div>' +
                '<span class="btn-arrow">→</span>' +
            '</button>';
        }

        card.innerHTML =
            '<div class="card-header-row">' +
                '<div class="card-header-left">' +
                    '<div class="card-icon-square ' + squareClass + '">' + iconHtml + '</div>' +
                    '<div class="card-id-group">' +
                        '<span class="card-slot-id">' + slotNum + '</span>' +
                        '<span class="card-slot-sub">' + vType + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="card-header-right">' +
                    '<div class="card-badges-row">' +
                        evBadgeHtml +
                        badgeHtml +
                    '</div>' +
                    '<span class="card-rate-text">₹' + rate + '/hr</span>' +
                '</div>' +
            '</div>' +
            middleHtml +
            actionHtml;

        grid.appendChild(card);
    });
}

/* ── Populate available slots dropdown in the Park modal ── */
function populateAvailableSlotDropdown(data) {
    var sel = document.getElementById("parkSlotSelect");
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">-- Select Available Slot --</option>';
    data.filter(function (s) { return s.status === "AVAILABLE"; })
        .forEach(function (s) {
            var slotNum = s.slot_number || s.id || "";
            var vType   = s.vehicle_type || s.type || "";
            var rate    = (s.hourly_rate !== undefined ? s.hourly_rate : s.rate) || 0;
            var opt = document.createElement("option");
            opt.value = slotNum;
            opt.textContent = slotNum + " (" + vType + " • ₹" + rate + "/hr)";
            sel.appendChild(opt);
        });
    if (prev) sel.value = prev;
}

/* ── Render the recent activity log table ── */
function renderLogsTable(logs) {
    var tbody = document.getElementById("activityTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!logs || logs.length === 0) {
        tbody.innerHTML = "<tr><td colspan='8' style='text-align:center;color:#64748b;padding:20px;'>No activity recorded yet. Park a vehicle to get started.</td></tr>";
        return;
    }

    logs.forEach(function (log) {
        var statusBadge = log.booking_status === "ACTIVE"
            ? "<span class='tbl-badge tbl-badge-active'>Active</span>"
            : "<span class='tbl-badge' style='background:#f1f5f9;color:#64748b;'>Completed</span>";
        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td><code style='font-size:0.8rem;'>" + (log.booking_id || "—") + "</code></td>" +
            "<td><strong>" + (log.slot_number || "—") + "</strong></td>" +
            "<td><code>" + (log.vehicle_number || "—") + "</code></td>" +
            "<td>" + (log.vehicle_type || "—") + "</td>" +
            "<td>" + (log.driver_name || "Guest") + "</td>" +
            "<td><small>" + (log.start_time || "—") + "</small></td>" +
            "<td><small>" + (log.end_time || "—") + "</small></td>" +
            "<td>" + statusBadge + "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Open Park Vehicle modal — optionally pre-select a slot ── */
function openParkModal(preselectedSlotNo) {
    document.getElementById("parkForm").reset();
    populateAvailableSlotDropdown(slots);
    if (preselectedSlotNo) {
        document.getElementById("parkSlotSelect").value = preselectedSlotNo;
    }
    openModal("parkModal");
    document.getElementById("parkVehicleNo").focus();
}

/* ── Open Checkout modal for a specific occupied slot ── */
function openCheckoutModal(slotNumber) {
    var slot = slots.find(function (s) { return (s.slot_number === slotNumber || s.id === slotNumber); });
    if (!slot) return;
    activeCheckoutSlot = slot;

    var slotNum   = slot.slot_number || slot.id || "—";
    var vehNo     = slot.vehicle_number || slot.vehicleNo || "—";
    var driver    = slot.driver_name || slot.driver || "—";
    var entryTime = slot.entry_time || slot.entryTime || "—";
    var rate      = (slot.hourly_rate !== undefined ? slot.hourly_rate : slot.rate) || 40;

    // Populate checkout summary
    setText("chkSlotId",     slotNum);
    setText("chkVehicleNo",  vehNo);
    setText("chkDriver",     driver);
    setText("chkEntryTime",  entryTime);
    setText("chkExitTime",   "Now");

    // Estimate fee (hourly_rate × 2hrs minimum — real calc done by PHP)
    setText("chkTotalFee",   "₹" + (rate * 2) + " (approx.)");
    openModal("checkoutModal");
}

/* ── Show a brief toast notification ── */
function showToast(message, type) {
    var toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.textContent = message;
    toast.className   = "toast-notification " + (type === "error" ? "toast-error" : "toast-success");
    toast.style.display = "block";
    setTimeout(function () { toast.style.display = "none"; }, 3500);
}

/* ── DOM ready: wire all events ── */
document.addEventListener("DOMContentLoaded", function () {
    loadUserHeader();
    updateClock();
    setInterval(updateClock, 1000);
    fetchSlots(); // Initial load from DB

    // Filter controls
    document.getElementById("slotSearchInput").addEventListener("input",  fetchSlots);
    document.getElementById("zoneFilter").addEventListener("change",      fetchSlots);
    document.getElementById("statusFilter").addEventListener("change",    fetchSlots);
    document.getElementById("evFilter").addEventListener("change",        fetchSlots);

    // Hero stat card click → quick filter by status
    document.querySelectorAll(".hero-stat-card").forEach(function (card) {
        card.addEventListener("click", function () {
            var s = this.getAttribute("data-status");
            if (s) { document.getElementById("statusFilter").value = s; fetchSlots(); }
        });
    });

    // Add Slot modal
    document.getElementById("openAddSlotBtn").addEventListener("click",     function () { document.getElementById("addSlotForm").reset(); openModal("addSlotModal"); document.getElementById("newSlotId").focus(); });
    document.getElementById("closeAddSlotModalBtn").addEventListener("click",function () { closeModal("addSlotModal"); });
    document.getElementById("cancelAddSlotBtn").addEventListener("click",   function () { closeModal("addSlotModal"); });

    // Park Vehicle modal
    document.getElementById("openParkModalBtn").addEventListener("click",   function () { openParkModal(null); });
    document.getElementById("closeParkModalBtn").addEventListener("click",  function () { closeModal("parkModal"); });
    document.getElementById("cancelParkBtn").addEventListener("click",      function () { closeModal("parkModal"); });

    // Checkout modal
    document.getElementById("closeCheckoutModalBtn").addEventListener("click", function () { closeModal("checkoutModal"); activeCheckoutSlot = null; });
    document.getElementById("cancelCheckoutBtn").addEventListener("click",      function () { closeModal("checkoutModal"); activeCheckoutSlot = null; });

    // Backdrop click closes modals
    window.addEventListener("click", function (e) {
        if (e.target.id === "parkModal")     { closeModal("parkModal");     activeCheckoutSlot = null; }
        if (e.target.id === "checkoutModal") { closeModal("checkoutModal"); activeCheckoutSlot = null; }
        if (e.target.id === "addSlotModal")  { closeModal("addSlotModal");  }
    });

    // ── Add Slot: POST to api/slots.php ──
    document.getElementById("addSlotForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var id   = document.getElementById("newSlotId").value.trim().toUpperCase();
        var zone = document.getElementById("newSlotZone").value;
        var type = document.getElementById("newSlotType").value;
        var rate = Number(document.getElementById("newSlotRate").value) || 40;
        var hasEV= document.getElementById("newSlotHasEV").checked;

        if (!id || !zone || !type) { alert("Please fill all required fields."); return; }

        fetch("../php/api/slots.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slot_number: id, zone: zone, vehicle_type: type, hourly_rate: rate, has_ev: hasEV })
        })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            closeModal("addSlotModal");
            showToast(res.message || "Slot added.", res.success ? "success" : "error");
            if (res.success) fetchSlots();
        })
        .catch(function () { showToast("⚠️ Network error.", "error"); });
    });

    // ── Park Vehicle: POST to api/park.php ──
    document.getElementById("parkForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var slotId  = document.getElementById("parkSlotSelect").value;
        var vehNo   = document.getElementById("parkVehicleNo").value.trim().toUpperCase();
        var vehType = document.getElementById("parkVehicleType").value;
        var dName   = document.getElementById("parkDriverName").value.trim();
        var dPhone  = document.getElementById("parkDriverPhone").value.trim();

        if (!slotId || !vehNo || !vehType) { alert("Slot, vehicle plate, and type are required."); return; }

        fetch("../php/api/park.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slotId: slotId, vehicleNo: vehNo, vehicleType: vehType, driverName: dName, driverPhone: dPhone })
        })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            closeModal("parkModal");
            showToast(res.message || (res.success ? "Vehicle parked." : "Error."), res.success ? "success" : "error");
            if (res.success) fetchSlots(); // Refresh from DB
        })
        .catch(function () { showToast("⚠️ Network error.", "error"); });
    });

    // ── Confirm Checkout: POST to api/checkout.php ──
    document.getElementById("confirmCheckoutBtn").addEventListener("click", function () {
        if (!activeCheckoutSlot) return;
        var payMode = document.getElementById("paymentMethod").value;

        var targetSlotNo = activeCheckoutSlot.slot_number || activeCheckoutSlot.id;
        fetch("../php/api/checkout.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slotId: targetSlotNo, paymentMode: payMode })
        })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            closeModal("checkoutModal");
            activeCheckoutSlot = null;
            showToast(res.message || (res.success ? "Checkout complete." : "Error."), res.success ? "success" : "error");
            if (res.success) fetchSlots(); // Refresh from DB
        })
        .catch(function () { showToast("⚠️ Network error.", "error"); });
    });

    // Logout
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.clear();
            window.location.href = "login.html";
        });
    }
});
