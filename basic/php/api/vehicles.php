<?php
/**
 * Smart Parking System - Vehicles Registry API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

try {
    $search = trim($_GET['search'] ?? '');
    $type = trim($_GET['type'] ?? 'ALL');

    $sql = "
        SELECT 
            v.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            v.brand,
            v.model,
            v.color,
            v.created_at,
            u.user_id,
            u.full_name AS owner_name,
            u.mobile AS owner_phone,
            u.email AS owner_email,
            b.booking_id,
            b.start_time,
            b.booking_status,
            s.slot_number,
            s.hourly_rate
        FROM vehicles v
        JOIN users u ON v.user_id = u.user_id
        LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id AND b.booking_status = 'ACTIVE'
        LEFT JOIN parking_slots s ON b.slot_id = s.slot_id
        WHERE 1=1
    ";

    $params = [];

    if ($type !== 'ALL') {
        $sql .= " AND v.vehicle_type = :vtype";
        $params[':vtype'] = $type;
    }

    if ($search !== '') {
        $sql .= " AND (v.vehicle_number LIKE :kw OR u.full_name LIKE :kw OR v.brand LIKE :kw OR s.slot_number LIKE :kw)";
        $params[':kw'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY (b.booking_status = 'ACTIVE') DESC, v.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $vehicles = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $vehicles]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Vehicles error: ' . $e->getMessage()]);
    exit;
}
?>
