/**
 * Smart Parking System - Transactions & Billing Controller
 * Fetches billing records from api/bills.php (PHP PDO / smart_parking_db).
 */

/* ── Guard: redirect to login if not authenticated ── */
(function () { if (!sessionStorage.getItem("sp_logged_in")) window.location.href = "login.html"; })();



/* ── Fetch from PHP API; fallback to demo on failure ── */
function fetchBills() {
    var search = document.getElementById("billSearchInput").value.trim();
    var mode   = document.getElementById("paymentModeFilter").value;

    var url = "../php/api/bills.php?search=" + encodeURIComponent(search) + "&mode=" + encodeURIComponent(mode);

    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && Array.isArray(result.data)) {
                renderBillsTable(result.data);
            } else {
                filterLocalBills(search, mode); // API responded but with no data
            }
        })
        .catch(function () {
            renderBillsTable([]); // Show empty state when API offline
        });
}

/* ── Render bills into the HTML table ── */
function renderBillsTable(data) {
    var tbody = document.getElementById("billsTableBody");
    tbody.innerHTML = "";

    // Calculate total of rendered bills and update the summary pill
    var total = 0;
    data.forEach(function (b) {
        if (b.payment_status === "PAID") total += parseFloat(b.amount || 0);
    });
    document.getElementById("totalAuditedAmount").textContent = "₹" + total.toFixed(2);

    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='11' style='text-align:center;color:#64748b;padding:24px;'>No billing records found for the selected criteria.</td></tr>";
        return;
    }

    data.forEach(function (b) {
        var tr = document.createElement("tr");

        // Colour-coded payment status badge
        var statusBadge = b.payment_status === "PAID"
            ? "<span class='tbl-badge tbl-badge-active'>PAID</span>"
            : "<span class='tbl-badge' style='background:#fffbeb;color:#92400e;border:1px solid #fcd34d;'>PENDING</span>";

        // Colour-coded payment mode chip
        var modeChip = b.payment_mode === "UPI"  ? "<span class='tbl-badge' style='background:#ede9fe;color:#5b21b6;'>UPI</span>"
                     : b.payment_mode === "CARD" ? "<span class='tbl-badge' style='background:#dbeafe;color:#1d4ed8;'>CARD</span>"
                     : "<span class='tbl-badge' style='background:#f0fdf4;color:#166534;'>CASH</span>";

        // Duration display
        var dur = b.duration_hours ? parseFloat(b.duration_hours).toFixed(1) + " hrs" : "Active";

        // Format date nicely
        var dateStr = b.generated_at ? b.generated_at.split(" ")[0] + "<br><small style='color:#64748b;'>" + b.generated_at.split(" ")[1] + "</small>" : "—";

        tr.innerHTML =
            "<td><code style='font-size:0.8rem;font-weight:bold;'>" + (b.bill_id || "—") + "</code></td>" +
            "<td><small style='color:#64748b;'>#" + (b.booking_id || "?") + "</small></td>" +
            "<td><code style='font-weight:bold;font-size:0.82rem;'>" + (b.vehicle_number || "—") + "</code></td>" +
            "<td>" + (b.vehicle_type || "—") + "</td>" +
            "<td><strong>" + (b.customer_name || "Guest") + "</strong><br><small style='color:#94a3b8;'>" + (b.customer_phone || "") + "</small></td>" +
            "<td>" + dur + "</td>" +
            "<td style='font-weight:800;color:#047857;font-size:1rem;'>₹" + parseFloat(b.amount || 0).toFixed(2) + "</td>" +
            "<td>" + modeChip + "</td>" +
            "<td>" + statusBadge + "</td>" +
            "<td style='font-size:0.82rem;'>" + dateStr + "</td>" +
            "<td><button class='btn btn-secondary btn-sm' onclick='showReceipt(" + JSON.stringify(b).replace(/'/g, "\\'") + ")'>Receipt</button></td>";

        tbody.appendChild(tr);
    });
}

/* ── Populate and open receipt modal ── */
function showReceipt(b) {
    document.getElementById("recBillId").textContent    = b.bill_id       || "BILL-???";
    document.getElementById("recPlate").textContent     = b.vehicle_number|| "—";
    document.getElementById("recType").textContent      = b.vehicle_type  || "—";
    document.getElementById("recCustomer").textContent  = (b.customer_name || "Guest") + (b.customer_phone ? " • " + b.customer_phone : "");
    document.getElementById("recSlot").textContent      = b.slot_number   || "—";
    document.getElementById("recStart").textContent     = b.start_time    || "—";
    document.getElementById("recEnd").textContent       = b.end_time      || "Still Parked";
    document.getElementById("recDuration").textContent  = b.duration_hours ? parseFloat(b.duration_hours).toFixed(1) + " hours" : "—";
    document.getElementById("recMode").textContent      = b.payment_mode  || "—";
    document.getElementById("recAmount").textContent    = "₹" + parseFloat(b.amount || 0).toFixed(2);
    document.getElementById("receiptModal").classList.remove("hidden");
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

/* ── DOM ready: wire up events ── */
document.addEventListener("DOMContentLoaded", function () {
    loadUserHeader();
    fetchBills();

    // Live search on keystroke
    document.getElementById("billSearchInput").addEventListener("input", fetchBills);
    // Filter on dropdown change
    document.getElementById("paymentModeFilter").addEventListener("change", fetchBills);

    // Receipt modal close buttons
    var modal = document.getElementById("receiptModal");
    document.getElementById("closeReceiptModalBtn").addEventListener("click", function () { modal.classList.add("hidden"); });
    document.getElementById("dismissReceiptBtn").addEventListener("click",    function () { modal.classList.add("hidden"); });

    // Close modal on backdrop click
    modal.addEventListener("click", function (e) {
        if (e.target === modal) modal.classList.add("hidden");
    });

    // Live clock update
    function updateClock() {
        var now = new Date();
        document.getElementById("headerDate").textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("headerTime").textContent = now.toLocaleTimeString("en-IN");
    }
    updateClock();
    setInterval(updateClock, 1000);
});
