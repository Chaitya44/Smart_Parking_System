<?php
/**
 * Smart Parking System - Slots API Endpoint
 * Strictly uses PHP PDO with prepared statements.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Support mode=logs for activity logs
        if (isset($_GET['mode']) && $_GET['mode'] === 'logs') {
            $stmt = $pdo->query("
                SELECT 
                    b.booking_id,
                    s.slot_number,
                    COALESCE(v.vehicle_number, '—') AS vehicle_number,
                    s.vehicle_type,
                    COALESCE(u.full_name, 'Guest') AS driver_name,
                    DATE_FORMAT(b.start_time, '%d %b %Y, %h:%i %p') AS start_time,
                    CASE WHEN b.end_time IS NOT NULL THEN DATE_FORMAT(b.end_time, '%d %b %Y, %h:%i %p') ELSE '—' END AS end_time,
                    b.booking_status
                FROM bookings b
                JOIN parking_slots s ON b.slot_id = s.slot_id
                LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
                LEFT JOIN users u ON b.user_id = u.user_id
                ORDER BY b.booking_id DESC
                LIMIT 10
            ");
            $logs = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $logs]);
            exit;
        }

        $zone = $_GET['zone'] ?? 'ALL';
        $status = $_GET['status'] ?? 'ALL';
        $ev = $_GET['ev'] ?? 'ALL';
        $search = trim($_GET['search'] ?? '');

        // Query slots with active booking and vehicle details
        $sql = "
            SELECT 
                s.slot_id,
                s.floor_no,
                s.slot_number,
                s.vehicle_type,
                s.hourly_rate,
                s.status,
                CASE 
                    WHEN s.slot_number LIKE 'A-%' THEN 'Zone A'
                    WHEN s.slot_number LIKE 'B-%' THEN 'Zone B'
                    WHEN s.slot_number LIKE 'C-%' THEN 'Zone C'
                    ELSE CONCAT('Floor ', s.floor_no)
                END AS zone,
                CASE WHEN s.vehicle_type = 'EV Vehicle' THEN 1 ELSE 0 END AS has_ev,
                b.booking_id,
                b.start_time AS entry_time,
                v.vehicle_number,
                u.full_name AS driver_name,
                u.mobile AS driver_phone
            FROM parking_slots s
            LEFT JOIN bookings b ON s.slot_id = b.slot_id AND b.booking_status = 'ACTIVE'
            LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
            LEFT JOIN users u ON b.user_id = u.user_id
            WHERE 1=1
        ";

        $params = [];

        // Apply zone filter
        if ($zone !== 'ALL') {
            if ($zone === 'Zone A') {
                $sql .= " AND s.slot_number LIKE 'A-%'";
            } elseif ($zone === 'Zone B') {
                $sql .= " AND s.slot_number LIKE 'B-%'";
            } elseif ($zone === 'Zone C') {
                $sql .= " AND s.slot_number LIKE 'C-%'";
            }
        }

        // Apply status filter
        if ($status !== 'ALL') {
            $sql .= " AND s.status = :status";
            $params[':status'] = $status;
        }

        // Apply EV capability filter
        if ($ev === 'EV_ONLY') {
            $sql .= " AND s.vehicle_type = 'EV Vehicle'";
        } elseif ($ev === 'NON_EV') {
            $sql .= " AND s.vehicle_type != 'EV Vehicle'";
        }

        // Apply search keyword filter
        if ($search !== '') {
            $sql .= " AND (s.slot_number LIKE :kw OR v.vehicle_number LIKE :kw OR u.full_name LIKE :kw)";
            $params[':kw'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY s.slot_number ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $slots = $stmt->fetchAll();

        // Format response for dashboard UI (both camelCase and snake_case for full compatibility)
        $formatted = array_map(function ($s) {
            $slotNo = $s['slot_number'];
            $vType  = $s['vehicle_type'];
            $rate   = (float)$s['hourly_rate'];
            $isEV   = (bool)$s['has_ev'];
            return [
                'id'             => $slotNo,
                'slot_number'    => $slotNo,
                'slotId'         => (int)$s['slot_id'],
                'slot_id'        => (int)$s['slot_id'],
                'zone'           => $s['zone'],
                'type'           => $vType,
                'vehicle_type'   => $vType,
                'status'         => $s['status'],
                'rate'           => $rate,
                'hourly_rate'    => $rate,
                'hasEV'          => $isEV,
                'has_ev'         => $isEV,
                'vehicleNo'      => $s['vehicle_number'] ?? '',
                'vehicle_number' => $s['vehicle_number'] ?? '',
                'driver'         => $s['driver_name'] ?? '',
                'driver_name'    => $s['driver_name'] ?? '',
                'phone'          => $s['driver_phone'] ?? '',
                'driver_phone'   => $s['driver_phone'] ?? '',
                'entryTime'      => $s['entry_time'] ?? '',
                'entry_time'     => $s['entry_time'] ?? ''
            ];
        }, $slots);

        echo json_encode(['success' => true, 'data' => $formatted]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'POST') {
    // Add new parking slot
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $slotNumber = trim($input['id'] ?? $input['slot_number'] ?? '');
    $zone = trim($input['zone'] ?? 'Zone A');
    $vehicleType = trim($input['type'] ?? $input['vehicle_type'] ?? '4-Wheeler Car');
    $rate = (float)($input['rate'] ?? $input['hourly_rate'] ?? 40.00);

    if (empty($slotNumber)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Slot Number is required.']);
        exit;
    }

    try {
        // Check uniqueness
        $check = $pdo->prepare("SELECT COUNT(*) FROM parking_slots WHERE slot_number = :num");
        $check->execute([':num' => $slotNumber]);
        if ($check->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => "Slot $slotNumber already exists."]);
            exit;
        }

        // Determine floor from zone
        $floor = 1;
        if (strpos($zone, 'B') !== false) $floor = 2;
        if (strpos($zone, 'C') !== false) $floor = 3;

        $insert = $pdo->prepare("
            INSERT INTO parking_slots (lot_id, floor_no, slot_number, vehicle_type, hourly_rate, status)
            VALUES (1, :floor, :slot, :vtype, :rate, 'AVAILABLE')
        ");
        $insert->execute([
            ':floor' => $floor,
            ':slot'  => strtoupper($slotNumber),
            ':vtype' => $vehicleType,
            ':rate'  => $rate
        ]);

        echo json_encode(['success' => true, 'message' => "Slot $slotNumber added successfully."]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add slot: ' . $e->getMessage()]);
        exit;
    }
}
?>
