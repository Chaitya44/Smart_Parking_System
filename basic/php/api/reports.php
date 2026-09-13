<?php
/**
 * Smart Parking System - Reports & Analytics API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

try {
    // 1. Revenue by Vehicle Type
    $vTypeStmt = $pdo->query("
        SELECT 
            v.vehicle_type,
            COUNT(b.bill_id) AS total_bills,
            COALESCE(SUM(b.amount), 0) AS total_amount
        FROM bills b
        JOIN bookings bk ON b.booking_id = bk.booking_id
        JOIN vehicles v ON bk.vehicle_id = v.vehicle_id
        WHERE b.payment_status = 'PAID'
        GROUP BY v.vehicle_type
    ");
    $revenueByVehicleType = $vTypeStmt->fetchAll();

    // 2. Revenue and Bookings by Zone / Floor
    $zoneStmt = $pdo->query("
        SELECT 
            CASE 
                WHEN s.slot_number LIKE 'A-%' THEN 'Zone A (4-Wheelers)'
                WHEN s.slot_number LIKE 'B-%' THEN 'Zone B (2-Wheelers)'
                WHEN s.slot_number LIKE 'C-%' THEN 'Zone C (EV Station)'
                ELSE CONCAT('Floor ', s.floor_no)
            END AS zone_name,
            COUNT(b.bill_id) AS total_sessions,
            COALESCE(SUM(b.amount), 0) AS zone_revenue
        FROM bills b
        JOIN bookings bk ON b.booking_id = bk.booking_id
        JOIN parking_slots s ON bk.slot_id = s.slot_id
        WHERE b.payment_status = 'PAID'
        GROUP BY zone_name
    ");
    $revenueByZone = $zoneStmt->fetchAll();

    // 3. Payment Mode Share
    $payModeStmt = $pdo->query("
        SELECT 
            payment_mode,
            COUNT(*) AS count,
            COALESCE(SUM(amount), 0) AS amount
        FROM bills
        WHERE payment_status = 'PAID'
        GROUP BY payment_mode
    ");
    $paymentModeShare = $payModeStmt->fetchAll();

    // 4. Overall Summary Totals
    $summary = $pdo->query("
        SELECT 
            (SELECT COUNT(*) FROM parking_slots) AS total_slots,
            (SELECT COUNT(*) FROM parking_slots WHERE status = 'OCCUPIED') AS currently_occupied,
            (SELECT COUNT(*) FROM bookings) AS all_time_bookings,
            (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE payment_status = 'PAID') AS all_time_revenue
    ")->fetch();

    echo json_encode([
        'success' => true,
        'data'    => [
            'summary'              => $summary,
            'revenueByVehicleType' => $revenueByVehicleType,
            'revenueByZone'        => $revenueByZone,
            'paymentModeShare'     => $paymentModeShare
        ]
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Reports error: ' . $e->getMessage()]);
    exit;
}
?>
