<?php
/**
 * Smart Parking System - Settings API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Settings error: ' . $e->getMessage()]);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save settings: ' . $e->getMessage()]);
        exit;
    }
}
?>
