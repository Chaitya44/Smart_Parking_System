(function () {
    var currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
    var $ = function (id) { return document.getElementById(id); };
    var escapeHtml = function (value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); };

    function renderVehicles(vehicles) {
        if (!vehicles.length) { $('vehicles').innerHTML = '<p class="empty">No vehicles registered yet.</p>'; return; }
        $('vehicles').innerHTML = '<div class="table-wrap"><table><thead><tr><th>Vehicle</th><th>Type</th><th>Details</th></tr></thead><tbody>' + vehicles.map(function (v) {
            return '<tr><td><strong>' + escapeHtml(v.vehicle_number) + '</strong></td><td>' + escapeHtml(v.vehicle_type) + '</td><td>' + escapeHtml([v.brand, v.model, v.color].filter(Boolean).join(' · ') || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    function renderBookings(bookings) {
        if (!bookings.length) { $('bookings').innerHTML = '<p class="empty">No parking history yet.</p>'; return; }
        $('bookings').innerHTML = '<div class="table-wrap"><table><thead><tr><th>Booking</th><th>Vehicle</th><th>Slot</th><th>Start</th><th>Status</th><th>Bill</th></tr></thead><tbody>' + bookings.map(function (b) {
            return '<tr><td>#' + escapeHtml(b.booking_id) + '</td><td>' + escapeHtml(b.vehicle_number) + '</td><td>' + escapeHtml(b.slot_number) + '</td><td>' + escapeHtml(b.start_time) + '</td><td><span class="status">' + escapeHtml(b.booking_status) + '</span></td><td>' + (b.amount == null ? '—' : currency.format(Number(b.amount)) + ' · ' + escapeHtml(b.payment_status || '')) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    function renderSlots(slots) {
        var available = slots.filter(function (s) { return s.status === 'AVAILABLE'; });
        $('slotSummary').textContent = available.length + ' of ' + slots.length + ' slots currently available';
        $('slots').innerHTML = slots.map(function (s) {
            return '<article class="slot ' + (s.status === 'AVAILABLE' ? 'available' : 'unavailable') + '"><div><strong>' + escapeHtml(s.slot_number) + '</strong><span>' + escapeHtml(s.zone || ('Floor ' + s.floor_no)) + '</span></div><p>' + escapeHtml(s.vehicle_type) + '</p><footer><b>' + currency.format(Number(s.hourly_rate)) + '/hr</b><span>' + escapeHtml(s.status) + '</span></footer></article>';
        }).join('');
    }

    Promise.all([
        fetch('../php/api/customer-data.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } }).then(function (r) { if (!r.ok) throw new Error('Could not load customer account.'); return r.json(); }),
        fetch('../php/api/slots.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } }).then(function (r) { if (!r.ok) throw new Error('Could not load parking slots.'); return r.json(); })
    ]).then(function (results) {
        var account = results[0], slotResult = results[1];
        if (!account.success || !slotResult.success) throw new Error('Could not load your dashboard data.');
        $('welcome').textContent = 'Welcome, ' + account.profile.full_name;
        $('profileName').textContent = account.profile.full_name;
        $('profileEmail').textContent = account.profile.email;
        $('profileMobile').textContent = account.profile.mobile || 'Not provided';
        $('profileAddress').textContent = account.profile.address || 'Not provided';
        $('vehicleCount').textContent = account.vehicles.length;
        $('bookingCount').textContent = account.bookings.length;
        $('activeCount').textContent = account.bookings.filter(function (b) { return b.booking_status === 'ACTIVE'; }).length;
        renderVehicles(account.vehicles);
        renderBookings(account.bookings);
        renderSlots(slotResult.data || []);
    }).catch(function (error) { $('pageError').textContent = error.message || 'Unable to load dashboard.'; $('pageError').hidden = false; });

    $('vehicleForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var message = $('vehicleMessage');
        var button = form.querySelector('button[type=submit]');
        button.disabled = true;
        message.className = 'form-message';
        message.textContent = 'Registering vehicle…';
        fetch('../php/api/vehicles.php', { method: 'POST', body: new FormData(form), credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
            .then(function (response) { return response.json().then(function (data) { if (!response.ok) throw new Error(data.message || 'Could not register vehicle.'); return data; }); })
            .then(function (result) { if (!result.success) throw new Error(result.message || 'Could not register vehicle.'); message.textContent = result.message; form.reset(); return fetch('../php/api/customer-data.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); }); })
            .then(function (account) { if (account.success) { $('vehicleCount').textContent = account.vehicles.length; renderVehicles(account.vehicles); } })
            .catch(function (error) { message.classList.add('error'); message.textContent = error.message || 'Could not register vehicle.'; })
            .finally(function () { button.disabled = false; });
    });

    $('logoutBtn').addEventListener('click', function () {
        fetch('../php/logout.php', { method: 'POST', credentials: 'same-origin' })
            .finally(function () { sessionStorage.clear(); window.location.replace('login.html'); });
    });
})();
