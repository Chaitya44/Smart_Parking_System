<?php
/**
 * Smart Parking System - Real-time KPI Stats API
 * Strictly uses PHP PDO.
 * Database: smart_parking_db
 */

header('Content-Type: application/json');
require_once "../db.php";

try {
    // 1. Slot status breakdown
    $slotCounts = $pdo->query("
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available,
            SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied,
            SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END) AS reserved
        FROM parking_slots
    ")->fetch();

    // 2. Total collected revenue
    $revStmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM bills WHERE payment_status = 'PAID'");
    $revenue = (float)$revStmt->fetchColumn();

    // 3. Vehicles in/out turnover
    $bookingCounts = $pdo->query("
        SELECT 
            COUNT(*) AS vehicles_in,
            SUM(CASE WHEN booking_status = 'COMPLETED' THEN 1 ELSE 0 END) AS vehicles_out
        FROM bookings
    ")->fetch();

    echo json_encode([
        'success' => true,
        'data'    => [
            'total'       => (int)($slotCounts['total'] ?? 0),
            'available'   => (int)($slotCounts['available'] ?? 0),
            'occupied'    => (int)($slotCounts['occupied'] ?? 0),
            'reserved'    => (int)($slotCounts['reserved'] ?? 0),
            'revenue'     => $revenue,
            'vehiclesIn'  => (int)($bookingCounts['vehicles_in'] ?? 0),
            'vehiclesOut' => (int)($bookingCounts['vehicles_out'] ?? 0)
        ]
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Stats error: ' . $e->getMessage()]);
    exit;
}
?>
