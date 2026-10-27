<?php
/**
 * Smart Parking System - Settings API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json; charset=UTF-8');
require_once "../auth.php";
require_admin(); // Server-side authorization: only ADMIN sessions may read or change settings.
require_once "../db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $lot = $pdo->query("SELECT * FROM parking_lots WHERE lot_id = 1 LIMIT 1")->fetch();
        $rates = $pdo->query("SELECT vehicle_type, MAX(hourly_rate) as rate FROM parking_slots GROUP BY vehicle_type")->fetchAll();

        echo json_encode([
            'success' => true,
            'data'    => [
                'lot'   => $lot,
                'rates' => $rates
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        error_log('Settings read failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to load system settings.']);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $lotName     = trim($input['lot_name'] ?? '');
    $location    = trim($input['location'] ?? '');
    $openingTime = trim($input['opening_time'] ?? '06:00:00');
    $closingTime = trim($input['closing_time'] ?? '23:30:00');

    $carRate  = (float)($input['car_rate'] ?? 40);
    $bikeRate = (float)($input['bike_rate'] ?? 20);
    $evRate   = (float)($input['ev_rate'] ?? 60);

    if ($lotName === '' || $location === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Lot name and location are required.']);
        exit;
    }

    foreach ([$carRate, $bikeRate, $evRate] as $rate) {
        if (!is_finite($rate) || $rate <= 0 || $rate > 100000) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Hourly rates must be greater than zero and no more than 100000.']);
            exit;
        }
    }

    if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $openingTime) ||
        !preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $closingTime)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Please provide valid opening and closing times.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Update lot
        $stmtLot = $pdo->prepare("
            UPDATE parking_lots 
            SET lot_name = :name, location = :loc, opening_time = :open, closing_time = :close 
            WHERE lot_id = 1
        ");
        $stmtLot->execute([
            ':name'  => $lotName,
            ':loc'   => $location,
            ':open'  => $openingTime,
            ':close' => $closingTime
        ]);

        // Update slot rates
        $pdo->prepare("UPDATE parking_slots SET hourly_rate = :r WHERE vehicle_type = '4-Wheeler Car'")->execute([':r' => $carRate]);
        $pdo->prepare("UPDATE parking_slots SET hourly_rate = :r WHERE vehicle_type LIKE '2-Wheeler%'")->execute([':r' => $bikeRate]);
        $pdo->prepare("UPDATE parking_slots SET hourly_rate = :r WHERE vehicle_type = 'EV Vehicle'")->execute([':r' => $evRate]);

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Settings and pricing updated successfully.']);
        exit;

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Settings update failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to save system settings. Please try again.']);
        exit;
    }
}

http_response_code(405);
header('Allow: GET, POST');
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit;
?>
