# Smart Parking System 🚗⚡

> A full-stack, real-time automated parking lot management and EV charging station platform designed for facility operators and vehicle owners.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B%20%2F%208.x-777bb4.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1.svg)](https://www.mysql.com/)
[![CSS3](https://img.shields.io/badge/Styling-Vanilla%20CSS3-1572B6.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

## 🌟 Overview

The **Smart Parking System** provides an end-to-end digital infrastructure for multi-zone parking facilities. Built with clean PHP (PDO), MySQL, vanilla modern CSS, and reactive vanilla JavaScript, the platform streamlines vehicle entry, real-time bay allocation, electric vehicle (EV) charger monitoring, automated fee calculation, and multi-channel billing.

---

## ✨ Key Features

### 🏢 Facility Operator & Admin Dashboard
- **Interactive Bay Visualizer**: Live color-coded occupancy grid across Zone A, Zone B, and Zone C.
- **EV Bay Telemetry**: Dedicated bays with high-voltage EV station tracking and real-time charging status.
- **Instant Check-In**: One-click allocation by license plate, vehicle category (4-Wheeler, 2-Wheeler, EV), and automated Indian Standard Time (`Asia/Kolkata`, `+05:30`) entry stamping.
- **Automated Checkout & Billing**: Duration-based hourly fare engine with instant digital receipt generation.
- **Multiple Settlement Channels**: Supports Cash, UPI QR code, and Debit/Credit cards with real-time revenue tallies.
- **Analytics & Reports**: Visualized occupancy rates, peak-hour distributions, vehicle type splits, and downloadable audit logs.

### 👤 Customer Experience
- **Dedicated Customer Portal**: Clean, restricted interface where drivers can view available bays, check active parking passes, and review past receipts without access to administrative revenue data.
- **Streamlined Onboarding**: Registration with real-time password strength validation and responsive login.

### 🎨 Modern Design & UI/UX
- **Custom Design System**: Built with modern typography (**Plus Jakarta Sans**), deep emerald gradients (`#064e3b` / `#10b981`), glassmorphism cards, and micro-interactions.
- **Responsive Layout**: Fluid layouts tested across desktop monitors, tablets, and mobile viewports.

---

## 🗂️ Project Structure

```text
smart_parking_system/
│
├── basic/
│   ├── css/
│   │   ├── home.css            # Landing page styles (Hero, Steps, Telemetry)
│   │   ├── dashboard.css       # Operator dashboard & slot matrix styles
│   │   ├── customer.css        # Customer view specific styling
│   │   ├── login.css           # Authentication card & state styling
│   │   └── register.css        # Registration & password strength meter styles
│   │
│   ├── html/
│   │   ├── index.html          # Public landing page with live telemetry
│   │   ├── dashboard.html      # Main operator facility dashboard
│   │   ├── customer.html       # Customer-specific portal
│   │   ├── reports.html        # Occupancy & financial reporting
│   │   ├── settings.html       # Slot & hourly rate configuration
│   │   ├── login.html          # Secure login portal
│   │   └── register.html       # New driver registration
│   │
│   ├── js/
│   │   ├── access-guard.js     # Client-side session and role protection
│   │   ├── dashboard.js        # Live slots, entry modal, and checkout logic
│   │   ├── customer.js         # Customer slot search and pass viewer
│   │   ├── reports.js          # Chart generation & tabular audit reports
│   │   ├── settings.js         # Slot and pricing modification controllers
│   │   ├── login.js            # Authentication form validation
│   │   └── register.js         # Validation and password strength meter
│   │
│   ├── php/
│   │   ├── db.php              # PDO database connection & timezone config
│   │   ├── auth.php            # Session validation and role check helper
│   │   ├── session.php         # User identity and profile provider
│   │   ├── login.php           # Secure password verify & session start
│   │   ├── register.php        # User creation with hashed passwords
│   │   └── api/
│   │       ├── slots.php       # Bay CRUD and occupancy status endpoints
│   │       ├── bills.php       # Check-in, checkout, and billing calculation
│   │       ├── stats.php       # Facility summary telemetry metrics
│   │       ├── reports.php     # Revenue, time-series, and category stats
│   │       ├── users.php       # User management endpoints
│   │       ├── settings.php    # System pricing & slot config
│   │       └── customer-data.php # Customer ticket history
│   │
│   └── database/
│       └── smart_parking.sql   # Complete database schema and initial seed data
│
├── LICENSE                     # MIT License
├── Smart_Parking_System_guide.pdf
├── Smart_Parking_System_Synopsis.pdf
└── README.md
