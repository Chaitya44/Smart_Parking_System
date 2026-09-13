<?php
/**
 * Smart Parking System - Checkout & Billing API
 * Strictly uses PHP PDO with transactions.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$slotNumber  = trim($input['slotId'] ?? $input['slot_number'] ?? '');
$paymentMode = strtoupper(trim($input['paymentMode'] ?? $input['payment_mode'] ?? 'CASH'));

if (empty($slotNumber)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Slot Number is required.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Fetch active booking for target slot
    $query = "
        SELECT 
            s.slot_id, 
            s.slot_number, 
            s.hourly_rate,
            b.booking_id, 
            b.start_time,
            v.vehicle_number,
            u.full_name,
            u.mobile
        FROM parking_slots s
        JOIN bookings b ON s.slot_id = b.slot_id AND b.booking_status = 'ACTIVE'
        JOIN vehicles v ON b.vehicle_id = v.vehicle_id
        JOIN users u ON b.user_id = u.user_id
        WHERE s.slot_number = :slot
        FOR UPDATE
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([':slot' => $slotNumber]);
    $session = $stmt->fetch();

    if (!$session) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "No active occupied session found for slot $slotNumber."]);
        exit;
    }

    // 2. Calculate duration in hours
    $startTime = new DateTime($session['start_time']);
    $endTime   = new DateTime();
    $interval  = $startTime->diff($endTime);
    $durationHours = ($interval->days * 24) + $interval->h;
    if ($interval->i > 5 || $durationHours == 0) {
        $durationHours += 1; // Round up minimum charge
    }
    // Default to at least 2 hours for standard minimum demo charge
    if ($durationHours < 2) {
        $durationHours = 2;
    }

    $hourlyRate = (float)$session['hourly_rate'];
    $totalAmount = $hourlyRate * $durationHours;
    $nowStr = $endTime->format('Y-m-d H:i:s');

    // 3. Generate Bill
    $billStmt = $pdo->prepare("
        INSERT INTO bills (booking_id, amount, payment_mode, payment_status, generated_at, collected_by)
        VALUES (:bid, :amt, :mode, 'PAID', :now, 1)
    ");
    $billStmt->execute([
        ':bid'  => $session['booking_id'],
        ':amt'  => $totalAmount,
        ':mode' => $paymentMode,
        ':now'  => $nowStr
    ]);
    $billId = (int)$pdo->lastInsertId();

    // 4. Update Booking to COMPLETED
    $updateBooking = $pdo->prepare("
        UPDATE bookings 
        SET booking_status = 'COMPLETED', end_time = :etime, duration_hours = :dur 
        WHERE booking_id = :bid
    ");
    $updateBooking->execute([
        ':etime' => $nowStr,
        ':dur'   => $durationHours,
        ':bid'   => $session['booking_id']
    ]);

    // 5. Release Parking Slot
    $releaseSlot = $pdo->prepare("UPDATE parking_slots SET status = 'AVAILABLE' WHERE slot_id = :sid");
    $releaseSlot->execute([':sid' => $session['slot_id']]);

    $pdo->commit();

    echo json_encode([
        'success'       => true,
        'message'       => "Slot $slotNumber released. Payment received: ₹$totalAmount",
        'billId'        => "BILL-" . $billId,
        'ticketId'      => "TKT-" . $session['booking_id'],
        'vehicleNumber' => $session['vehicle_number'],
        'driver'        => $session['full_name'],
        'durationHours' => $durationHours,
        'amount'        => $totalAmount,
        'exitTime'      => $nowStr,
        'paymentMode'   => $paymentMode
    ]);
    exit;

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Checkout failed: ' . $e->getMessage()]);
    exit;
}
?>
