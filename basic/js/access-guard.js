(function () {
    var requiredRole = (document.body && document.body.dataset.requiredRole || '').toUpperCase();
    if (!requiredRole) return;

    fetch('../php/session.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
        .then(function (response) {
            if (!response.ok) throw new Error('not-authenticated');
            return response.json();
        })
        .then(function (session) {
            if (!session.authenticated) throw new Error('not-authenticated');
            if (session.role !== requiredRole) {
                window.location.replace(session.role === 'USER' ? 'customer.html' :
                    session.role === 'ADMIN' ? 'dashboard.html' : 'login.html');
                return;
            }
            document.documentElement.classList.add('access-verified');
            document.dispatchEvent(new CustomEvent('sp:session-ready', { detail: session }));
        })
        .catch(function () {
            window.location.replace('login.html?error=login_required');
        });
})();
