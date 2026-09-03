var STORAGE_KEY_SLOTS = "smart_parking_slots_v3";
var STORAGE_KEY_LOGS = "smart_parking_logs_v3";
var STORAGE_KEY_REV = "smart_parking_revenue_v3";

var VEHICLE_NO_PATTERN = /^[A-Za-z0-9\s-]{6,15}$/;
var DRIVER_NAME_PATTERN = /^[A-Za-z\s]{3,60}$/;
var MOBILE_PATTERN = /^[6-9]\d{9}$/;
var SLOT_ID_PATTERN = /^[A-Za-z0-9-]{2,10}$/;

var INITIAL_SLOTS = [
    { id: "A-01", zone: "Zone A", type: "4-Wheeler Car", status: "OCCUPIED", vehicleNo: "MH 02 AB 1234", driver: "Aarav Patel", phone: "9876543210", entryTime: "2026-09-03 16:30", rate: 40, hasEV: false },
    { id: "A-02", zone: "Zone A", type: "4-Wheeler Car", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 40, hasEV: false },
    { id: "A-03", zone: "Zone A", type: "4-Wheeler Car", status: "OCCUPIED", vehicleNo: "DL 01 CD 5678", driver: "Rohit Verma", phone: "9823456781", entryTime: "2026-09-03 17:15", rate: 40, hasEV: false },
    { id: "A-04", zone: "Zone A", type: "4-Wheeler Car", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 40, hasEV: true },
    { id: "A-05", zone: "Zone A", type: "4-Wheeler Car", status: "RESERVED", vehicleNo: "MH 12 VIP 0001", driver: "Director General", phone: "9811122233", entryTime: "", rate: 40, hasEV: false },
    { id: "A-06", zone: "Zone A", type: "4-Wheeler Car", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 40, hasEV: false },
    { id: "A-07", zone: "Zone A", type: "4-Wheeler Car", status: "OCCUPIED", vehicleNo: "MH 04 EF 9012", driver: "Sanya Gupta", phone: "9765432109", entryTime: "2026-09-03 18:00", rate: 40, hasEV: false },
    { id: "A-08", zone: "Zone A", type: "4-Wheeler Car", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 40, hasEV: true },
    { id: "B-01", zone: "Zone B", type: "2-Wheeler Bike", status: "OCCUPIED", vehicleNo: "MH 03 GH 3456", driver: "Karan Johar", phone: "9834567812", entryTime: "2026-09-03 17:45", rate: 20, hasEV: false },
    { id: "B-02", zone: "Zone B", type: "2-Wheeler Scooter", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 20, hasEV: false },
    { id: "B-03", zone: "Zone B", type: "2-Wheeler Bike", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 20, hasEV: false },
    { id: "B-04", zone: "Zone B", type: "2-Wheeler Scooter", status: "OCCUPIED", vehicleNo: "MH 01 IJ 7890", driver: "Pooja Sharma", phone: "9912345678", entryTime: "2026-09-03 18:30", rate: 20, hasEV: false },
    { id: "B-05", zone: "Zone B", type: "2-Wheeler Bike", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 20, hasEV: false },
    { id: "B-06", zone: "Zone B", type: "2-Wheeler Scooter", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 20, hasEV: false },
    { id: "C-01", zone: "Zone C", type: "EV Vehicle", status: "OCCUPIED", vehicleNo: "MH 02 EV 2026", driver: "Vikram Mehta", phone: "9870011223", entryTime: "2026-09-03 16:00", rate: 60, hasEV: true },
    { id: "C-02", zone: "Zone C", type: "EV Vehicle", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 60, hasEV: true },
    { id: "C-03", zone: "Zone C", type: "EV Vehicle", status: "RESERVED", vehicleNo: "KA 05 EV 9999", driver: "Fleet EV 1", phone: "9845098450", entryTime: "", rate: 60, hasEV: true },
    { id: "C-04", zone: "Zone C", type: "EV Vehicle", status: "AVAILABLE", vehicleNo: "", driver: "", phone: "", entryTime: "", rate: 60, hasEV: true }
];

var INITIAL_LOGS = [
    { ticketId: "TKT-1001", slotId: "A-01", vehicleNo: "MH 02 AB 1234", type: "4-Wheeler Car", driver: "Aarav Patel", phone: "9876543210", entryTime: "2026-09-03 16:30", exitTime: "-", status: "ACTIVE", fee: 40 },
    { ticketId: "TKT-1002", slotId: "A-03", vehicleNo: "DL 01 CD 5678", type: "4-Wheeler Car", driver: "Rohit Verma", phone: "9823456781", entryTime: "2026-09-03 17:15", exitTime: "-", status: "ACTIVE", fee: 40 },
    { ticketId: "TKT-1003", slotId: "C-01", vehicleNo: "MH 02 EV 2026", type: "EV Vehicle", driver: "Vikram Mehta", phone: "9870011223", entryTime: "2026-09-03 16:00", exitTime: "-", status: "ACTIVE", fee: 60 },
    { ticketId: "TKT-1004", slotId: "B-01", vehicleNo: "MH 03 GH 3456", type: "2-Wheeler Bike", driver: "Karan Johar", phone: "9834567812", entryTime: "2026-09-03 17:45", exitTime: "-", status: "ACTIVE", fee: 20 },
    { ticketId: "TKT-1005", slotId: "A-07", vehicleNo: "MH 04 EF 9012", type: "4-Wheeler Car", driver: "Sanya Gupta", phone: "9765432109", entryTime: "2026-09-03 18:00", exitTime: "-", status: "ACTIVE", fee: 40 },
    { ticketId: "TKT-1006", slotId: "B-04", vehicleNo: "MH 01 IJ 7890", type: "2-Wheeler Scooter", driver: "Pooja Sharma", phone: "9912345678", entryTime: "2026-09-03 18:30", exitTime: "-", status: "ACTIVE", fee: 20 },
    { ticketId: "TKT-0998", slotId: "A-02", vehicleNo: "MH 04 XY 7711", type: "4-Wheeler Car", driver: "Sameer Nair", phone: "9899988877", entryTime: "2026-09-03 14:10", exitTime: "2026-09-03 16:15", status: "COMPLETED", fee: 120 },
    { ticketId: "TKT-0999", slotId: "B-02", vehicleNo: "MH 02 ZZ 4455", type: "2-Wheeler Scooter", driver: "Deepak Joshi", phone: "9871122334", entryTime: "2026-09-03 15:00", exitTime: "2026-09-03 17:00", status: "COMPLETED", fee: 40 }
];

var INITIAL_REV = 160;

var ParkingAPI = {
    _loadState: function () {
        var slots = localStorage.getItem(STORAGE_KEY_SLOTS);
        var logs = localStorage.getItem(STORAGE_KEY_LOGS);
        var rev = localStorage.getItem(STORAGE_KEY_REV);

        if (!slots || !logs || rev === null) {
            localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(INITIAL_SLOTS));
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
            localStorage.setItem(STORAGE_KEY_REV, String(INITIAL_REV));
            return {
                slots: JSON.parse(JSON.stringify(INITIAL_SLOTS)),
                logs: JSON.parse(JSON.stringify(INITIAL_LOGS)),
                revenue: INITIAL_REV
            };
        }

        return {
            slots: JSON.parse(slots),
            logs: JSON.parse(logs),
            revenue: Number(rev)
        };
    },

    _saveState: function (state) {
        localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(state.slots));
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(state.logs));
        localStorage.setItem(STORAGE_KEY_REV, String(state.revenue));
    },

    getSummary: function () {
        var self = this;
        return new Promise(function (resolve) {
            var state = self._loadState();
            var total = state.slots.length;
            var available = 0;
            var occupied = 0;
            var reserved = 0;

            for (var i = 0; i < state.slots.length; i++) {
                if (state.slots[i].status === "AVAILABLE") available++;
                else if (state.slots[i].status === "OCCUPIED") occupied++;
                else if (state.slots[i].status === "RESERVED") reserved++;
            }

            resolve({
                success: true,
                data: {
                    total: total,
                    available: available,
                    occupied: occupied,
                    reserved: reserved,
                    revenue: state.revenue
                }
            });
        });
    },

    getSlots: function (filters) {
        var self = this;
        return new Promise(function (resolve) {
            var state = self._loadState();
            var result = state.slots.filter(function (slot) {
                if (filters.zone && filters.zone !== "ALL" && slot.zone !== filters.zone) {
                    return false;
                }
                if (filters.status && filters.status !== "ALL" && slot.status !== filters.status) {
                    return false;
                }
                if (filters.ev && filters.ev !== "ALL") {
                    if (filters.ev === "EV_ONLY" && !slot.hasEV) return false;
                    if (filters.ev === "NON_EV" && slot.hasEV) return false;
                }
                if (filters.search && filters.search.trim() !== "") {
                    var query = filters.search.trim().toLowerCase();
                    var matchId = slot.id.toLowerCase().indexOf(query) !== -1;
                    var matchPlate = (slot.vehicleNo || "").toLowerCase().indexOf(query) !== -1;
                    var matchDriver = (slot.driver || "").toLowerCase().indexOf(query) !== -1;
                    if (!matchId && !matchPlate && !matchDriver) {
                        return false;
                    }
                }
                return true;
            });

            resolve({
                success: true,
                data: result
            });
        });
    },

    getSlotById: function (slotId) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var state = self._loadState();
            for (var i = 0; i < state.slots.length; i++) {
                if (state.slots[i].id === slotId) {
                    resolve({ success: true, data: state.slots[i] });
                    return;
                }
            }
            reject(new Error("Slot not found"));
        });
    },

    addSlot: function (slotData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var state = self._loadState();
            var cleanId = slotData.id.trim().toUpperCase();

            for (var i = 0; i < state.slots.length; i++) {
                if (state.slots[i].id === cleanId) {
                    reject(new Error("Slot ID " + cleanId + " already exists."));
                    return;
                }
            }

            var newSlot = {
                id: cleanId,
                zone: slotData.zone,
                type: slotData.type,
                status: "AVAILABLE",
                vehicleNo: "",
                driver: "",
                phone: "",
                entryTime: "",
                rate: Number(slotData.rate) || 40,
                hasEV: Boolean(slotData.hasEV)
            };

            state.slots.push(newSlot);
            self._saveState(state);

            resolve({
                success: true,
                data: newSlot
            });
        });
    },

    parkVehicle: function (payload) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var state = self._loadState();
            var targetIndex = -1;

            for (var i = 0; i < state.slots.length; i++) {
                if (state.slots[i].id === payload.slotId) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) {
                reject(new Error("Invalid slot ID"));
                return;
            }

            if (state.slots[targetIndex].status === "OCCUPIED") {
                reject(new Error("Slot is already occupied"));
                return;
            }

            var now = new Date();
            var timeStr = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0") + " " +
                String(now.getHours()).padStart(2, "0") + ":" +
                String(now.getMinutes()).padStart(2, "0");

            var rate = state.slots[targetIndex].rate || 40;
            if (payload.vehicleType.indexOf("Bike") !== -1 || payload.vehicleType.indexOf("Scooter") !== -1) {
                rate = 20;
            }
            if (payload.vehicleType.indexOf("EV") !== -1) {
                rate = 60;
            }

            state.slots[targetIndex].status = "OCCUPIED";
            state.slots[targetIndex].type = payload.vehicleType;
            state.slots[targetIndex].vehicleNo = payload.vehicleNo.toUpperCase();
            state.slots[targetIndex].driver = payload.driverName;
            state.slots[targetIndex].phone = payload.driverPhone;
            state.slots[targetIndex].entryTime = timeStr;
            state.slots[targetIndex].rate = rate;

            var ticketId = "TKT-" + Math.floor(1000 + Math.random() * 9000);
            var logEntry = {
                ticketId: ticketId,
                slotId: payload.slotId,
                vehicleNo: payload.vehicleNo.toUpperCase(),
                type: payload.vehicleType,
                driver: payload.driverName,
                phone: payload.driverPhone,
                entryTime: timeStr,
                exitTime: "-",
                status: "ACTIVE",
                fee: rate
            };

            state.logs.unshift(logEntry);
            self._saveState(state);

            resolve({
                success: true,
                data: {
                    slot: state.slots[targetIndex],
                    ticket: logEntry
                }
            });
        });
    },

    checkoutVehicle: function (slotId, method) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var state = self._loadState();
            var targetIndex = -1;

            for (var i = 0; i < state.slots.length; i++) {
                if (state.slots[i].id === slotId) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1 || state.slots[targetIndex].status !== "OCCUPIED") {
                reject(new Error("Active occupied vehicle not found for slot"));
                return;
            }

            var slot = state.slots[targetIndex];
            var now = new Date();
            var exitTimeStr = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0") + " " +
                String(now.getHours()).padStart(2, "0") + ":" +
                String(now.getMinutes()).padStart(2, "0");

            var durationHours = 2;
            var fee = (slot.rate || 40) * durationHours;

            for (var j = 0; j < state.logs.length; j++) {
                if (state.logs[j].slotId === slotId && state.logs[j].status === "ACTIVE") {
                    state.logs[j].status = "COMPLETED";
                    state.logs[j].exitTime = exitTimeStr;
                    state.logs[j].fee = fee;
                    state.logs[j].paymentMethod = method || "Cash";
                    break;
                }
            }

            slot.status = "AVAILABLE";
            slot.vehicleNo = "";
            slot.driver = "";
            slot.phone = "";
            slot.entryTime = "";

            state.revenue += fee;
            self._saveState(state);

            resolve({
                success: true,
                data: {
                    slotId: slotId,
                    fee: fee,
                    exitTime: exitTimeStr
                }
            });
        });
    },

    getRecentActivity: function () {
        var self = this;
        return new Promise(function (resolve) {
            var state = self._loadState();
            resolve({
                success: true,
                data: state.logs
            });
        });
    },

    resetToDefault: function () {
        var self = this;
        return new Promise(function (resolve) {
            localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(INITIAL_SLOTS));
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
            localStorage.setItem(STORAGE_KEY_REV, String(INITIAL_REV));
            resolve({ success: true });
        });
    }
};

function showFieldError(inputId, errorId, message) {
    var el = document.getElementById(inputId);
    if (el) {
        el.classList.remove("valid");
        el.classList.add("error");
    }
    var errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
}

function clearFieldError(inputId, errorId) {
    var el = document.getElementById(inputId);
    if (el) {
        el.classList.remove("error");
        el.classList.add("valid");
    }
    var errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = "";
}

function resetFormValidation(formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var inputs = form.querySelectorAll("input, select");
    inputs.forEach(function (el) {
        el.classList.remove("error", "valid");
    });
    var errors = form.querySelectorAll(".error-msg");
    errors.forEach(function (err) {
        err.textContent = "";
    });
}

function validateParkSlot() {
    var val = document.getElementById("parkSlotSelect").value;
    if (!val) {
        showFieldError("parkSlotSelect", "parkSlotError", "Please select an available parking slot.");
        return false;
    }
    clearFieldError("parkSlotSelect", "parkSlotError");
    return true;
}

function validateParkVehicleNo() {
    var val = document.getElementById("parkVehicleNo").value.trim().toUpperCase();
    if (!val) {
        showFieldError("parkVehicleNo", "parkVehicleNoError", "Vehicle registration number is required.");
        return false;
    }
    if (!VEHICLE_NO_PATTERN.test(val)) {
        showFieldError("parkVehicleNo", "parkVehicleNoError", "Enter a valid license plate (6-15 letters, numbers, spaces or hyphens).");
        return false;
    }
    clearFieldError("parkVehicleNo", "parkVehicleNoError");
    return true;
}

function validateParkVehicleType() {
    var val = document.getElementById("parkVehicleType").value;
    if (!val) {
        showFieldError("parkVehicleType", "parkVehicleTypeError", "Please select a vehicle category.");
        return false;
    }
    clearFieldError("parkVehicleType", "parkVehicleTypeError");
    return true;
}

function validateParkDriverName() {
    var val = document.getElementById("parkDriverName").value.trim();
    if (!val) {
        showFieldError("parkDriverName", "parkDriverNameError", "Driver name is required.");
        return false;
    }
    if (!DRIVER_NAME_PATTERN.test(val)) {
        showFieldError("parkDriverName", "parkDriverNameError", "Driver name must be 3-60 letters and spaces only.");
        return false;
    }
    clearFieldError("parkDriverName", "parkDriverNameError");
    return true;
}

function validateParkDriverPhone() {
    var val = document.getElementById("parkDriverPhone").value.trim();
    if (!val) {
        showFieldError("parkDriverPhone", "parkDriverPhoneError", "Driver contact number is required.");
        return false;
    }
    if (!MOBILE_PATTERN.test(val)) {
        showFieldError("parkDriverPhone", "parkDriverPhoneError", "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
        return false;
    }
    clearFieldError("parkDriverPhone", "parkDriverPhoneError");
    return true;
}

function validateNewSlotId() {
    var val = document.getElementById("newSlotId").value.trim().toUpperCase();
    if (!val) {
        showFieldError("newSlotId", "newSlotIdError", "Slot ID is required.");
        return false;
    }
    if (!SLOT_ID_PATTERN.test(val)) {
        showFieldError("newSlotId", "newSlotIdError", "Slot ID must be 2-10 letters, numbers, or hyphens (e.g. A-09).");
        return false;
    }
    clearFieldError("newSlotId", "newSlotIdError");
    return true;
}

function validateNewSlotZone() {
    var val = document.getElementById("newSlotZone").value;
    if (!val) {
        showFieldError("newSlotZone", "newSlotZoneError", "Please select a parking zone.");
        return false;
    }
    clearFieldError("newSlotZone", "newSlotZoneError");
    return true;
}

function validateNewSlotType() {
    var val = document.getElementById("newSlotType").value;
    if (!val) {
        showFieldError("newSlotType", "newSlotTypeError", "Please select a vehicle category.");
        return false;
    }
    clearFieldError("newSlotType", "newSlotTypeError");
    return true;
}

function validateNewSlotRate() {
    var val = document.getElementById("newSlotRate").value.trim();
    if (!val) {
        showFieldError("newSlotRate", "newSlotRateError", "Hourly rate is required.");
        return false;
    }
    var num = Number(val);
    if (isNaN(num) || num < 10 || num > 500) {
        showFieldError("newSlotRate", "newSlotRateError", "Hourly rate must be between ₹10 and ₹500.");
        return false;
    }
    clearFieldError("newSlotRate", "newSlotRateError");
    return true;
}

function getVehicleIcon(type, hasEV) {
    if (hasEV || type === "EV Vehicle" || type === "EV Charging") {
        return "⚡🚗";
    }
    if (type.indexOf("Scooter") !== -1) {
        return "🛵";
    }
    if (type.indexOf("Bike") !== -1) {
        return "🏍️";
    }
    return "🚗";
}

var currentActiveCheckoutSlot = null;

function updateClock() {
    var el = document.getElementById("liveClock");
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function refreshSummary() {
    return ParkingAPI.getSummary().then(function (res) {
        if (!res.success) return;
        var d = res.data;
        document.getElementById("statTotalSlots").textContent = d.total;
        document.getElementById("statAvailableSlots").textContent = d.available;
        document.getElementById("statOccupiedSlots").textContent = d.occupied;
        document.getElementById("statReservedSlots").textContent = d.reserved;
        document.getElementById("statRevenue").textContent = "₹" + d.revenue;
    });
}

function refreshSlots() {
    var zone = document.getElementById("zoneFilter").value;
    var status = document.getElementById("statusFilter").value;
    var ev = document.getElementById("evFilter").value;
    var search = document.getElementById("slotSearchInput").value;

    return ParkingAPI.getSlots({ zone: zone, status: status, ev: ev, search: search }).then(function (res) {
        if (!res.success) return;
        var grid = document.getElementById("slotsGrid");
        grid.innerHTML = "";

        if (res.data.length === 0) {
            grid.innerHTML = "<p style='color: #64748b; padding: 24px; grid-column: 1/-1; text-align: center;'>No slots matching the current filter criteria.</p>";
            return;
        }

        res.data.forEach(function (slot) {
            var card = document.createElement("div");
            var statusClass = slot.status.toLowerCase();
            card.className = "slot-card " + statusClass;
            card.dataset.slotId = slot.id;

            var badgeText = "Available";
            var badgeClass = "pill-avail";
            if (slot.status === "OCCUPIED") {
                badgeText = "Occupied";
                badgeClass = "pill-occ";
            } else if (slot.status === "RESERVED") {
                badgeText = "Reserved";
                badgeClass = "pill-res";
            }

            var iconEmoji = getVehicleIcon(slot.type, slot.hasEV);
            var evBadgeHtml = slot.hasEV ? "<span class='ev-badge' title='Equipped with EV Station'>⚡ EV</span>" : "";

            var stateBoxHtml = "";
            var footerBtn = "";

            if (slot.status === "OCCUPIED") {
                var entryHour = slot.entryTime ? slot.entryTime.split(" ")[1] : "-";
                stateBoxHtml =
                    "<div class='slot-state-box box-occupied'>" +
                        "<div class='plate-row'>" + (slot.vehicleNo || "OCCUPIED") + "</div>" +
                        "<div class='plate-meta'>" + (slot.driver || "Guest") + " • In: " + entryHour + "</div>" +
                    "</div>";
                footerBtn = "<button type='button' class='btn-slot btn-slot-release'>Release &amp; Bill</button>";
            } else if (slot.status === "AVAILABLE") {
                stateBoxHtml =
                    "<div class='slot-state-box box-available'>" +
                        "<div class='vacant-title'>Available Spot</div>" +
                        "<div class='vacant-sub'>Ready for vehicle entry</div>" +
                    "</div>";
                footerBtn = "<button type='button' class='btn-slot btn-slot-park'>+ Park Vehicle</button>";
            } else {
                stateBoxHtml =
                    "<div class='slot-state-box box-reserved'>" +
                        "<div class='reserved-title'>" + (slot.driver || "VIP Guest") + "</div>" +
                        "<div class='reserved-sub'>Reserved space</div>" +
                    "</div>";
                footerBtn = "<button type='button' class='btn-slot btn-slot-disabled' disabled>Reserved</button>";
            }

            card.innerHTML =
                "<div class='slot-header'>" +
                    "<div class='slot-title-wrap'>" +
                        "<div class='vehicle-icon-box'>" + iconEmoji + "</div>" +
                        "<span class='slot-id'>" + slot.id + "</span>" +
                    "</div>" +
                    "<div class='slot-badge-wrap'>" +
                        evBadgeHtml +
                        "<span class='slot-status-pill " + badgeClass + "'>" + badgeText + "</span>" +
                    "</div>" +
                "</div>" +
                "<div class='slot-info-row'>" +
                    "<span class='slot-zone-tag'>" + slot.zone + " • " + slot.type + "</span>" +
                    "<span class='slot-rate-tag'>₹" + (slot.rate || 40) + "/hr</span>" +
                "</div>" +
                stateBoxHtml +
                "<div class='slot-footer'>" +
                    footerBtn +
                "</div>";

            card.addEventListener("click", function (e) {
                if (e.target.tagName === "BUTTON" && e.target.disabled) return;
                if (slot.status === "AVAILABLE") {
                    openParkModal(slot.id);
                } else if (slot.status === "OCCUPIED") {
                    openCheckoutModal(slot);
                }
            });

            grid.appendChild(card);
        });

        populateAvailableSlotsDropdown();
    });
}

function populateAvailableSlotsDropdown() {
    var select = document.getElementById("parkSlotSelect");
    var currentVal = select.value;

    ParkingAPI.getSlots({ zone: "ALL", status: "AVAILABLE", ev: "ALL" }).then(function (res) {
        if (!res.success) return;
        select.innerHTML = "<option value=''>-- Choose an Available Slot --</option>";
        res.data.forEach(function (slot) {
            var opt = document.createElement("option");
            opt.value = slot.id;
            var evLabel = slot.hasEV ? " [⚡ EV]" : "";
            opt.textContent = slot.id + " (" + slot.zone + " - " + slot.type + evLabel + ")";
            select.appendChild(opt);
        });

        if (currentVal) {
            select.value = currentVal;
        }
    });
}

function refreshActivityLogs() {
    return ParkingAPI.getRecentActivity().then(function (res) {
        if (!res.success) return;
        var tbody = document.getElementById("activityTableBody");
        tbody.innerHTML = "";
        document.getElementById("logCount").textContent = res.data.length;

        if (res.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='10' style='text-align: center; color: #64748b; padding: 20px;'>No recent parking logs found.</td></tr>";
            return;
        }

        res.data.forEach(function (log) {
            var tr = document.createElement("tr");

            var badgeClass = log.status === "ACTIVE" ? "tbl-badge-active" : "tbl-badge-completed";
            var actionBtn = "";

            if (log.status === "ACTIVE") {
                actionBtn = "<button type='button' class='btn btn-secondary btn-sm checkout-row-btn' data-slot='" + log.slotId + "'>Checkout</button>";
            } else {
                actionBtn = "<span style='color: #64748b; font-size: 0.8rem; font-weight: 600;'>Completed</span>";
            }

            tr.innerHTML =
                "<td><strong>" + log.ticketId + "</strong></td>" +
                "<td><span style='font-weight: bold; color: #1a7a4a;'>" + log.slotId + "</span></td>" +
                "<td><code style='font-weight: bold;'>" + log.vehicleNo + "</code></td>" +
                "<td>" + log.type + "</td>" +
                "<td>" + (log.driver || "-") + " (" + (log.phone || "-") + ")</td>" +
                "<td>" + log.entryTime + "</td>" +
                "<td>" + log.exitTime + "</td>" +
                "<td><span class='tbl-badge " + badgeClass + "'>" + log.status + "</span></td>" +
                "<td>₹" + (log.fee || 0) + "</td>" +
                "<td>" + actionBtn + "</td>";

            tbody.appendChild(tr);
        });

        var checkoutButtons = tbody.querySelectorAll(".checkout-row-btn");
        checkoutButtons.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var slotId = this.dataset.slot;
                ParkingAPI.getSlotById(slotId).then(function (res) {
                    if (res.success) {
                        openCheckoutModal(res.data);
                    }
                });
            });
        });
    });
}

function openAddSlotModal() {
    resetFormValidation("addSlotForm");
    var modal = document.getElementById("addSlotModal");
    document.getElementById("newSlotId").value = "";
    document.getElementById("newSlotZone").value = "";
    document.getElementById("newSlotType").value = "";
    document.getElementById("newSlotRate").value = "40";
    document.getElementById("newSlotHasEV").checked = false;
    modal.classList.remove("hidden");
    document.getElementById("newSlotId").focus();
}

function closeAddSlotModal() {
    document.getElementById("addSlotModal").classList.add("hidden");
}

function handleAddSlotSubmit(e) {
    e.preventDefault();

    var okId = validateNewSlotId();
    var okZone = validateNewSlotZone();
    var okType = validateNewSlotType();
    var okRate = validateNewSlotRate();

    if (!okId || !okZone || !okType || !okRate) {
        var firstError = document.querySelector("#addSlotForm .error");
        if (firstError) firstError.focus();
        return;
    }

    var slotId = document.getElementById("newSlotId").value.trim().toUpperCase();
    var zone = document.getElementById("newSlotZone").value;
    var type = document.getElementById("newSlotType").value;
    var rate = document.getElementById("newSlotRate").value;
    var hasEV = document.getElementById("newSlotHasEV").checked;

    ParkingAPI.addSlot({
        id: slotId,
        zone: zone,
        type: type,
        rate: rate,
        hasEV: hasEV
    }).then(function () {
        closeAddSlotModal();
        refreshSummary();
        refreshSlots();
    }).catch(function (err) {
        showFieldError("newSlotId", "newSlotIdError", err.message);
        document.getElementById("newSlotId").focus();
    });
}

function openParkModal(preselectedSlotId) {
    resetFormValidation("parkForm");
    var modal = document.getElementById("parkModal");
    var select = document.getElementById("parkSlotSelect");

    document.getElementById("parkVehicleNo").value = "";
    document.getElementById("parkVehicleType").value = "";
    document.getElementById("parkDriverName").value = "";
    document.getElementById("parkDriverPhone").value = "";

    ParkingAPI.getSlots({ zone: "ALL", status: "AVAILABLE", ev: "ALL" }).then(function (res) {
        select.innerHTML = "<option value=''>-- Choose an Available Slot --</option>";
        res.data.forEach(function (slot) {
            var opt = document.createElement("option");
            opt.value = slot.id;
            var evLabel = slot.hasEV ? " [⚡ EV]" : "";
            opt.textContent = slot.id + " (" + slot.zone + " - " + slot.type + evLabel + ")";
            select.appendChild(opt);
        });

        if (preselectedSlotId) {
            select.value = preselectedSlotId;
            validateParkSlot();
        }

        modal.classList.remove("hidden");
        document.getElementById("parkVehicleNo").focus();
    });
}

function closeParkModal() {
    document.getElementById("parkModal").classList.add("hidden");
}

function openCheckoutModal(slot) {
    currentActiveCheckoutSlot = slot;
    var modal = document.getElementById("checkoutModal");

    var evIndicator = slot.hasEV ? " [⚡ EV Station]" : "";
    document.getElementById("chkSlotId").textContent = slot.id + evIndicator;
    document.getElementById("chkVehicleNo").textContent = slot.vehicleNo || "-";
    document.getElementById("chkVehicleType").textContent = slot.type + " (₹" + (slot.rate || 40) + "/hr)";
    document.getElementById("chkDriver").textContent = (slot.driver || "Guest") + (slot.phone ? " • " + slot.phone : "");
    document.getElementById("chkEntryTime").textContent = slot.entryTime || "Earlier today";

    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    document.getElementById("chkExitTime").textContent = "Now (" + timeStr + ")";
    document.getElementById("chkDuration").textContent = "2 Hours (Standard Minimum)";

    var rate = slot.rate || 40;
    var total = rate * 2;
    document.getElementById("chkTotalFee").textContent = "₹" + total;

    modal.classList.remove("hidden");
}

function closeCheckoutModal() {
    currentActiveCheckoutSlot = null;
    document.getElementById("checkoutModal").classList.add("hidden");
}

function handleParkFormSubmit(e) {
    e.preventDefault();

    var okSlot = validateParkSlot();
    var okVehicleNo = validateParkVehicleNo();
    var okType = validateParkVehicleType();
    var okDriver = validateParkDriverName();
    var okPhone = validateParkDriverPhone();

    if (!okSlot || !okVehicleNo || !okType || !okDriver || !okPhone) {
        var firstError = document.querySelector("#parkForm .error");
        if (firstError) firstError.focus();
        return;
    }

    var slotId = document.getElementById("parkSlotSelect").value;
    var vehicleNo = document.getElementById("parkVehicleNo").value.trim().toUpperCase();
    var vehicleType = document.getElementById("parkVehicleType").value;
    var driverName = document.getElementById("parkDriverName").value.trim();
    var driverPhone = document.getElementById("parkDriverPhone").value.trim();

    ParkingAPI.parkVehicle({
        slotId: slotId,
        vehicleNo: vehicleNo,
        vehicleType: vehicleType,
        driverName: driverName,
        driverPhone: driverPhone
    }).then(function () {
        closeParkModal();
        refreshSummary();
        refreshSlots();
        refreshActivityLogs();
    }).catch(function (err) {
        showFieldError("parkSlotSelect", "parkSlotError", err.message);
    });
}

function handleConfirmCheckout() {
    if (!currentActiveCheckoutSlot) return;

    var method = document.getElementById("paymentMethod").value;
    var slotId = currentActiveCheckoutSlot.id;

    ParkingAPI.checkoutVehicle(slotId, method).then(function () {
        closeCheckoutModal();
        refreshSummary();
        refreshSlots();
        refreshActivityLogs();
    }).catch(function (err) {
        alert("Checkout Failed: " + err.message);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    setInterval(updateClock, 1000);

    refreshSummary();
    refreshSlots();
    refreshActivityLogs();

    document.getElementById("slotSearchInput").addEventListener("input", refreshSlots);
    document.getElementById("zoneFilter").addEventListener("change", refreshSlots);
    document.getElementById("statusFilter").addEventListener("change", refreshSlots);
    document.getElementById("evFilter").addEventListener("change", refreshSlots);

    var parkSlotSelect = document.getElementById("parkSlotSelect");
    var parkVehicleNo = document.getElementById("parkVehicleNo");
    var parkVehicleType = document.getElementById("parkVehicleType");
    var parkDriverName = document.getElementById("parkDriverName");
    var parkDriverPhone = document.getElementById("parkDriverPhone");

    parkSlotSelect.addEventListener("change", validateParkSlot);
    parkSlotSelect.addEventListener("blur", validateParkSlot);

    parkVehicleNo.addEventListener("input", function () {
        if (parkVehicleNo.classList.contains("error")) validateParkVehicleNo();
    });
    parkVehicleNo.addEventListener("blur", validateParkVehicleNo);

    parkVehicleType.addEventListener("change", validateParkVehicleType);
    parkVehicleType.addEventListener("blur", validateParkVehicleType);

    parkDriverName.addEventListener("input", function () {
        if (parkDriverName.classList.contains("error")) validateParkDriverName();
    });
    parkDriverName.addEventListener("blur", validateParkDriverName);

    parkDriverPhone.addEventListener("input", function () {
        if (parkDriverPhone.classList.contains("error")) validateParkDriverPhone();
    });
    parkDriverPhone.addEventListener("blur", validateParkDriverPhone);

    var newSlotId = document.getElementById("newSlotId");
    var newSlotZone = document.getElementById("newSlotZone");
    var newSlotType = document.getElementById("newSlotType");
    var newSlotRate = document.getElementById("newSlotRate");

    newSlotId.addEventListener("input", function () {
        if (newSlotId.classList.contains("error")) validateNewSlotId();
    });
    newSlotId.addEventListener("blur", validateNewSlotId);

    newSlotZone.addEventListener("change", validateNewSlotZone);
    newSlotZone.addEventListener("blur", validateNewSlotZone);

    newSlotType.addEventListener("change", validateNewSlotType);
    newSlotType.addEventListener("blur", validateNewSlotType);

    newSlotRate.addEventListener("input", function () {
        if (newSlotRate.classList.contains("error")) validateNewSlotRate();
    });
    newSlotRate.addEventListener("blur", validateNewSlotRate);

    document.getElementById("openAddSlotBtn").addEventListener("click", openAddSlotModal);
    document.getElementById("closeAddSlotModalBtn").addEventListener("click", closeAddSlotModal);
    document.getElementById("cancelAddSlotBtn").addEventListener("click", closeAddSlotModal);
    document.getElementById("addSlotForm").addEventListener("submit", handleAddSlotSubmit);

    document.getElementById("openParkModalBtn").addEventListener("click", function () {
        openParkModal(null);
    });

    document.getElementById("closeParkModalBtn").addEventListener("click", closeParkModal);
    document.getElementById("cancelParkBtn").addEventListener("click", closeParkModal);

    document.getElementById("closeCheckoutModalBtn").addEventListener("click", closeCheckoutModal);
    document.getElementById("cancelCheckoutBtn").addEventListener("click", closeCheckoutModal);

    document.getElementById("parkForm").addEventListener("submit", handleParkFormSubmit);
    document.getElementById("confirmCheckoutBtn").addEventListener("click", handleConfirmCheckout);

    document.getElementById("resetDataBtn").addEventListener("click", function () {
        if (confirm("Reset all parking slots and logs back to initial dummy database state?")) {
            ParkingAPI.resetToDefault().then(function () {
                refreshSummary();
                refreshSlots();
                refreshActivityLogs();
            });
        }
    });

    window.addEventListener("click", function (e) {
        var pModal = document.getElementById("parkModal");
        var cModal = document.getElementById("checkoutModal");
        var aModal = document.getElementById("addSlotModal");
        if (e.target === pModal) closeParkModal();
        if (e.target === cModal) closeCheckoutModal();
        if (e.target === aModal) closeAddSlotModal();
    });
});
