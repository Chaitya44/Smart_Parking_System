-- =======================================================
-- Smart Parking System Database Schema
-- Database Name: smart_parking_db (Compulsory suffix: db)
-- Strict PDO | Clean schema | 1 Admin only
-- =======================================================

CREATE DATABASE IF NOT EXISTS `smart_parking_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_parking_db`;

-- 1. USERS Table (Registered Customers / Drivers)
CREATE TABLE IF NOT EXISTS `users` (
    `user_id`       INT AUTO_INCREMENT PRIMARY KEY,
    `full_name`     VARCHAR(100)  NOT NULL,
    `email`         VARCHAR(150)  UNIQUE NOT NULL,
    `mobile`        VARCHAR(20)   NOT NULL,
    `password`      VARCHAR(255)  NOT NULL,
    `address`       TEXT          NULL,
    `profile_image` VARCHAR(255)  DEFAULT 'default-avatar.png',
    `status`        ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
    `created_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. PARKING_LOTS Table (Parking Facility Master)
CREATE TABLE IF NOT EXISTS `parking_lots` (
    `lot_id`        INT AUTO_INCREMENT PRIMARY KEY,
    `lot_name`      VARCHAR(100) NOT NULL,
    `location`      VARCHAR(255) NOT NULL,
    `city`          VARCHAR(100) NOT NULL,
    `total_floors`  INT          DEFAULT 3,
    `total_slots`   INT          DEFAULT 18,
    `opening_time`  TIME         DEFAULT '06:00:00',
    `closing_time`  TIME         DEFAULT '23:30:00'
) ENGINE=InnoDB;

-- 3. PARKING_SLOTS Table (Individual Parking Bays)
CREATE TABLE IF NOT EXISTS `parking_slots` (
    `slot_id`      INT AUTO_INCREMENT PRIMARY KEY,
    `lot_id`       INT NOT NULL,
    `floor_no`     INT DEFAULT 1,
    `slot_number`  VARCHAR(20)  NOT NULL UNIQUE,
    `vehicle_type` ENUM('2-Wheeler Bike','2-Wheeler Scooter','4-Wheeler Car','EV Vehicle') DEFAULT '4-Wheeler Car',
    `hourly_rate`  DECIMAL(8,2) DEFAULT 40.00,
    `status`       ENUM('AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE') DEFAULT 'AVAILABLE',
    FOREIGN KEY (`lot_id`) REFERENCES `parking_lots`(`lot_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. VEHICLES Table (Vehicles linked to Users)
CREATE TABLE IF NOT EXISTS `vehicles` (
    `vehicle_id`     INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`        INT NOT NULL,
    `vehicle_number` VARCHAR(30) NOT NULL UNIQUE,
    `vehicle_type`   ENUM('2-Wheeler Bike','2-Wheeler Scooter','4-Wheeler Car','EV Vehicle') DEFAULT '4-Wheeler Car',
    `brand`          VARCHAR(50) NULL,
    `model`          VARCHAR(50) NULL,
    `color`          VARCHAR(30) NULL,
    `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. ADMINS Table (System Operators and Super Admins)
CREATE TABLE IF NOT EXISTS `admins` (
    `admin_id`    INT AUTO_INCREMENT PRIMARY KEY,
    `full_name`   VARCHAR(100) NOT NULL,
    `email`       VARCHAR(150) UNIQUE NOT NULL,
    `mobile`      VARCHAR(20)  NOT NULL,
    `password`    VARCHAR(255) NOT NULL,
    `designation` VARCHAR(100) DEFAULT 'Operator',
    `status`      ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `last_login`  DATETIME NULL
) ENGINE=InnoDB;

-- 6. BOOKINGS Table (Active and Historical Parking Sessions)
CREATE TABLE IF NOT EXISTS `bookings` (
    `booking_id`     INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`        INT NOT NULL,
    `vehicle_id`     INT NOT NULL,
    `slot_id`        INT NOT NULL,
    `booking_date`   DATE     NOT NULL,
    `start_time`     DATETIME NOT NULL,
    `end_time`       DATETIME NULL,
    `duration_hours` INT      DEFAULT 1,
    `booking_status` ENUM('ACTIVE','COMPLETED','CANCELLED') DEFAULT 'ACTIVE',
    FOREIGN KEY (`user_id`)    REFERENCES `users`(`user_id`)         ON DELETE CASCADE,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`vehicle_id`)   ON DELETE CASCADE,
    FOREIGN KEY (`slot_id`)    REFERENCES `parking_slots`(`slot_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. BILLS Table (Payment Transactions and Invoices)
CREATE TABLE IF NOT EXISTS `bills` (
    `bill_id`        INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id`     INT NOT NULL,
    `amount`         DECIMAL(10,2) NOT NULL,
    `payment_mode`   ENUM('CASH','UPI','CARD','WALLET') DEFAULT 'CASH',
    `payment_status` ENUM('PENDING','PAID','REFUNDED')  DEFAULT 'PAID',
    `generated_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
    `collected_by`   INT NULL,
    FOREIGN KEY (`booking_id`)  REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
    FOREIGN KEY (`collected_by`) REFERENCES `admins`(`admin_id`)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =======================================================
-- SEED DATA: 1 Admin + 1 Parking Lot + 18 Clean Slots
-- No fake users, vehicles, bookings, or bills.
-- All real records will come from actual system usage.
-- =======================================================

-- Seed: Default Parking Lot
INSERT INTO `parking_lots` (`lot_id`,`lot_name`,`location`,`city`,`total_floors`,`total_slots`,`opening_time`,`closing_time`)
VALUES (1,'Smart Parking Central','MG Road, Sector 14','Bengaluru',3,18,'06:00:00','23:30:00')
ON DUPLICATE KEY UPDATE `lot_name` = VALUES(`lot_name`);

-- Seed: Single Super Admin
-- Password: admin123 (hashed with PHP password_hash)
INSERT INTO `admins` (`admin_id`,`full_name`,`email`,`mobile`,`password`,`designation`,`status`)
VALUES (1,'Admin','admin@smartparking.com','9876500000','$2y$10$IcdRGuJyIGVf1.CKPRC6eOlRMbqrLODcLSBcgva1tJr0CE42Qgr8i','Super Admin','ACTIVE')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `password` = VALUES(`password`);

-- Seed: 18 Parking Slots — Zone A (Cars), Zone B (2-Wheelers), Zone C (EV)
-- All start as AVAILABLE — ready for real vehicle check-ins
INSERT INTO `parking_slots` (`lot_id`,`floor_no`,`slot_number`,`vehicle_type`,`hourly_rate`,`status`) VALUES
(1,1,'A-01','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-02','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-03','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-04','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-05','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-06','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-07','4-Wheeler Car',40.00,'AVAILABLE'),
(1,1,'A-08','4-Wheeler Car',40.00,'AVAILABLE'),
(1,2,'B-01','2-Wheeler Bike',   20.00,'AVAILABLE'),
(1,2,'B-02','2-Wheeler Scooter',20.00,'AVAILABLE'),
(1,2,'B-03','2-Wheeler Bike',   20.00,'AVAILABLE'),
(1,2,'B-04','2-Wheeler Scooter',20.00,'AVAILABLE'),
(1,2,'B-05','2-Wheeler Bike',   20.00,'AVAILABLE'),
(1,2,'B-06','2-Wheeler Scooter',20.00,'AVAILABLE'),
(1,3,'C-01','EV Vehicle',60.00,'AVAILABLE'),
(1,3,'C-02','EV Vehicle',60.00,'AVAILABLE'),
(1,3,'C-03','EV Vehicle',60.00,'AVAILABLE'),
(1,3,'C-04','EV Vehicle',60.00,'AVAILABLE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
