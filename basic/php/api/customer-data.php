<?php
header('Content-Type: application/json; charset=UTF-8');
require_once '../auth.php';
require_customer();
require_once '../db.php';
$userId = (int)$_SESSION['auth_id'];
try {
    $profileStmt = $pdo->prepare('SELECT user_id, full_name, email, mobile, address, created_at FROM users WHERE user_id = :id LIMIT 1');
    $profileStmt->execute([':id' => $userId]);
    $profile = $profileStmt->fetch();
    if (!$profile) json_error('Customer account was not found.', 404);

    $bookingStmt = $pdo->prepare("SELECT b.booking_id, b.booking_date, b.start_time, b.end_time, b.duration_hours, b.booking_status,
        v.vehicle_number, v.vehicle_type, s.slot_number, s.hourly_rate,
        bi.amount, bi.payment_mode, bi.payment_status, bi.generated_at
        FROM bookings b
        JOIN vehicles v ON v.vehicle_id = b.vehicle_id AND v.user_id = b.user_id
        JOIN parking_slots s ON s.slot_id = b.slot_id
        LEFT JOIN bills bi ON bi.booking_id = b.booking_id
        WHERE b.user_id = :id ORDER BY b.booking_id DESC LIMIT 100");
    $bookingStmt->execute([':id' => $userId]);
    $bookings = $bookingStmt->fetchAll();

    $vehicleStmt = $pdo->prepare('SELECT vehicle_id, vehicle_number, vehicle_type, brand, model, color, created_at FROM vehicles WHERE user_id = :id ORDER BY created_at DESC');
    $vehicleStmt->execute([':id' => $userId]);
    $vehicles = $vehicleStmt->fetchAll();

    echo json_encode(['success' => true, 'profile' => $profile, 'vehicles' => $vehicles, 'bookings' => $bookings]);
} catch (PDOException $e) {
    error_log('Customer portal error: ' . $e->getMessage());
    json_error('Unable to load your account details right now.', 500);
}
