<?php
/**
 * Smart Parking System - Park Vehicle / Check-in API
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
$vehicleNo   = strtoupper(trim($input['vehicleNo'] ?? $input['vehicle_number'] ?? ''));
$vehicleType = trim($input['vehicleType'] ?? $input['vehicle_type'] ?? '4-Wheeler Car');
$driverName  = trim($input['driverName'] ?? $input['driver_name'] ?? 'Guest Driver');
$driverPhone = trim($input['driverPhone'] ?? $input['driver_phone'] ?? '9876543210');

if (empty($slotNumber) || empty($vehicleNo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Slot Number and Vehicle Plate Number are required.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Verify Slot Availability
    $slotStmt = $pdo->prepare("SELECT slot_id, status, hourly_rate FROM parking_slots WHERE slot_number = :num FOR UPDATE");
    $slotStmt->execute([':num' => $slotNumber]);
    $slot = $slotStmt->fetch();

    if (!$slot) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Slot $slotNumber not found."]);
        exit;
    }

    if ($slot['status'] === 'OCCUPIED') {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => "Slot $slotNumber is already occupied."]);
        exit;
    }

    // 2. Find or Create User (Customer)
    $userStmt = $pdo->prepare("SELECT user_id FROM users WHERE mobile = :mobile LIMIT 1");
    $userStmt->execute([':mobile' => $driverPhone]);
    $userId = $userStmt->fetchColumn();

    if (!$userId) {
        $cleanEmail = strtolower(str_replace(' ', '', $driverName)) . rand(100, 999) . "@smartparking.local";
        $insertUser = $pdo->prepare("
            INSERT INTO users (full_name, email, mobile, password, status)
            VALUES (:name, :email, :mobile, :pass, 'ACTIVE')
        ");
        $insertUser->execute([
            ':name'   => $driverName,
            ':email'  => $cleanEmail,
            ':mobile' => $driverPhone,
            ':pass'   => password_hash('user123', PASSWORD_DEFAULT)
        ]);
        $userId = (int)$pdo->lastInsertId();
    }

    // 3. Find or Create Vehicle
    $vehStmt = $pdo->prepare("SELECT vehicle_id FROM vehicles WHERE vehicle_number = :vno LIMIT 1");
    $vehStmt->execute([':vno' => $vehicleNo]);
    $vehicleId = $vehStmt->fetchColumn();

    if (!$vehicleId) {
        $insertVeh = $pdo->prepare("
            INSERT INTO vehicles (user_id, vehicle_number, vehicle_type)
            VALUES (:uid, :vno, :vtype)
        ");
        $insertVeh->execute([
            ':uid'   => $userId,
            ':vno'   => $vehicleNo,
            ':vtype' => $vehicleType
        ]);
        $vehicleId = (int)$pdo->lastInsertId();
    }

    // 4. Create Active Booking
    $now = date('Y-m-d H:i:s');
    $today = date('Y-m-d');
    $bookingStmt = $pdo->prepare("
        INSERT INTO bookings (user_id, vehicle_id, slot_id, booking_date, start_time, duration_hours, booking_status)
        VALUES (:uid, :vid, :sid, :bdate, :stime, 1, 'ACTIVE')
    ");
    $bookingStmt->execute([
        ':uid'   => $userId,
        ':vid'   => $vehicleId,
        ':sid'   => $slot['slot_id'],
        ':bdate' => $today,
        ':stime' => $now
    ]);
    $bookingId = (int)$pdo->lastInsertId();

    // 5. Update Slot Status to OCCUPIED
    $updateSlot = $pdo->prepare("UPDATE parking_slots SET status = 'OCCUPIED' WHERE slot_id = :sid");
    $updateSlot->execute([':sid' => $slot['slot_id']]);

    $pdo->commit();

    echo json_encode([
        'success'   => true,
        'message'   => "Vehicle $vehicleNo checked into slot $slotNumber.",
        'ticketId'  => "TKT-" . $bookingId,
        'entryTime' => $now
    ]);
    exit;

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
    exit;
}
?>
