<?php
/**
 * Smart Parking System - Billing & Transactions API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

try {
    $mode = trim($_GET['mode'] ?? 'ALL');
    $status = trim($_GET['status'] ?? 'ALL');
    $search = trim($_GET['search'] ?? '');

    $sql = "
        SELECT 
            b.bill_id,
            b.amount,
            b.payment_mode,
            b.payment_status,
            b.generated_at,
            bk.booking_id,
            bk.start_time,
            bk.end_time,
            bk.duration_hours,
            v.vehicle_number,
            v.vehicle_type,
            u.full_name AS customer_name,
            u.mobile AS customer_phone,
            s.slot_number,
            a.full_name AS collected_by_admin
        FROM bills b
        JOIN bookings bk ON b.booking_id = bk.booking_id
        JOIN vehicles v ON bk.vehicle_id = v.vehicle_id
        JOIN users u ON bk.user_id = u.user_id
        JOIN parking_slots s ON bk.slot_id = s.slot_id
        LEFT JOIN admins a ON b.collected_by = a.admin_id
        WHERE 1=1
    ";

    $params = [];

    if ($mode !== 'ALL') {
        $sql .= " AND b.payment_mode = :pmode";
        $params[':pmode'] = $mode;
    }

    if ($status !== 'ALL') {
        $sql .= " AND b.payment_status = :pstatus";
        $params[':pstatus'] = $status;
    }

    if ($search !== '') {
        $sql .= " AND (v.vehicle_number LIKE :kw OR u.full_name LIKE :kw OR s.slot_number LIKE :kw OR b.bill_id LIKE :kw)";
        $params[':kw'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY b.generated_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bills = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $bills]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Bills error: ' . $e->getMessage()]);
    exit;
}
?>
