<?php
/**
 * Smart Parking System - Database Connection Module
 * Implements strict PHP Data Objects (PDO) for secure, prepared SQL execution.
 * Database: smart_parking_db
 */

// Database configuration with environment variable fallbacks for live cloud deployment
$host    = getenv('DB_HOST') ?: 'localhost';
$dbname  = getenv('DB_NAME') ?: 'smart_parking_db';
$user    = getenv('DB_USER') ?: 'root';
$pass    = getenv('DB_PASS') ?: '';
$port    = getenv('DB_PORT') ?: '3306';
$charset = 'utf8mb4';

// Data Source Name (DSN)
$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";

// Strict PDO attributes for security and reliable performance
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_PERSISTENT         => false,
];

try {
    // Initialize primary PDO instance
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Return structured JSON error response if called via API
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
    die("Database Connection Error: " . htmlspecialchars($e->getMessage()));
}
?>
