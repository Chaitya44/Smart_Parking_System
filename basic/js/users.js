/**
 * Smart Parking System - Users & Staff Controller
 * Fetches admin and customer records from api/users.php (PHP PDO / smart_parking_db).
 */

/* ── Guard: redirect to login if not authenticated ── */
(function () { if (!sessionStorage.getItem("sp_logged_in")) window.location.href = "login.html"; })();





/* ── Fetch from API, fall back to demo on failure ── */
function fetchUsers() {
    fetch("../php/api/users.php")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success && result.data) {
                renderAdminsTable(result.data.admins || []);
                renderUsersTable(result.data.users   || []);
            } else {
                renderAdminsTable([]);
                renderUsersTable([]);
            }
        })
        .catch(function () {
            renderAdminsTable([]);
            renderUsersTable([]);
        });
}

/* ── Render the staff/admins table ── */
function renderAdminsTable(admins) {
    var tbody = document.getElementById("adminsTableBody");
    tbody.innerHTML = "";

    if (!admins || admins.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;color:#64748b;padding:24px;'>No operators found.</td></tr>";
        return;
    }

    admins.forEach(function (a, idx) {
        var statusBadge = a.status === "ACTIVE"
            ? "<span class='tbl-badge tbl-badge-active'>Active</span>"
            : "<span class='tbl-badge' style='background:#fee2e2;color:#991b1b;'>Inactive</span>";

        var lastLogin = a.last_login ? a.last_login.split(" ")[0] + "<br><small style='color:#94a3b8;'>" + a.last_login.split(" ")[1] + "</small>" : "Never";

        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + (idx + 1) + "</td>" +
            "<td><strong>" + (a.full_name || "—") + "</strong></td>" +
            "<td><small>" + (a.email || "—") + "</small></td>" +
            "<td>" + (a.mobile || "—") + "</td>" +
            "<td><span class='tbl-badge' style='background:#ede9fe;color:#5b21b6;'>" + (a.designation || "Operator") + "</span></td>" +
            "<td>" + statusBadge + "</td>" +
            "<td style='font-size:0.82rem;'>" + lastLogin + "</td>";
        tbody.appendChild(tr);
    });
}

/* ── Render the registered customers table ── */
function renderUsersTable(users) {
    var tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;color:#64748b;padding:24px;'>No registered customers yet.</td></tr>";
        return;
    }

    users.forEach(function (u, idx) {
        var statusBadge = u.status === "ACTIVE"
            ? "<span class='tbl-badge tbl-badge-active'>Active</span>"
            : "<span class='tbl-badge' style='background:#fee2e2;color:#991b1b;'>Inactive</span>";

        var joined = u.created_at ? u.created_at.split(" ")[0] : "—";

        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + (idx + 1) + "</td>" +
            "<td><strong>" + (u.full_name || "—") + "</strong></td>" +
            "<td><small>" + (u.email || "—") + "</small></td>" +
            "<td>" + (u.mobile || "—") + "</td>" +
            "<td>" + (u.address || "—") + "</td>" +
            "<td>" + statusBadge + "</td>" +
            "<td>" + joined + "</td>";
        tbody.appendChild(tr);
    });
}

/* ── DOM ready: wire modal and submit form ── */
document.addEventListener("DOMContentLoaded", function () {
    fetchUsers();

    var modal      = document.getElementById("addStaffModal");
    var openBtn    = document.getElementById("openAddStaffBtn");
    var closeBtn   = document.getElementById("closeAddStaffModalBtn");
    var cancelBtn  = document.getElementById("cancelAddStaffBtn");
    var form       = document.getElementById("addStaffForm");

    // Open modal and clear form fields
    openBtn.addEventListener("click", function () {
        form.reset();
        modal.classList.remove("hidden");
        document.getElementById("staffName").focus();
    });

    // Close modal helpers
    function closeModal() { modal.classList.add("hidden"); }
    closeBtn.addEventListener("click",  closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

    // Submit: POST to API, then refresh table
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var name   = document.getElementById("staffName").value.trim();
        var email  = document.getElementById("staffEmail").value.trim();
        var mobile = document.getElementById("staffMobile").value.trim();
        var desig  = document.getElementById("staffDesig").value;
        var pass   = document.getElementById("staffPassword").value.trim() || "admin123";

        if (!name || !email || !mobile) {
            alert("Name, email, and mobile are required.");
            return;
        }

        // POST to backend API
        fetch("../php/api/users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, email: email, mobile: mobile, designation: desig, password: pass })
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            alert(result.message || "Done.");
            if (result.success) {
                closeModal();
                fetchUsers(); // Refresh the table from API
            }
        })
        .catch(function () {
            alert("Network error. Could not connect to API.");
        });
    });

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

    loadUserHeader();

    // Live clock
    function updateClock() {
        var now = new Date();
        document.getElementById("headerDate").textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("headerTime").textContent = now.toLocaleTimeString("en-IN");
    }
    updateClock();
    setInterval(updateClock, 1000);
});
