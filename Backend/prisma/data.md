# FleetFlow Database Seed Data Report
**Date:** February 21, 2026
**Status:** Initial Seed Data

---

## 👤 User Accounts
These credentials are used for testing the different role-based access levels in the system.

| Name | Email | Role | Status | Password (Raw) |
| :--- | :--- | :--- | :--- | :--- |
| Fleet Manager | manager@fleetflow.com | manager | active | password123 |
| Trip Dispatcher | dispatcher@fleetflow.com | dispatcher | active | password123 |
| Safety Officer | safety@fleetflow.com | safety | active | password123 |
| Data Analyst | analyst@fleetflow.com | analyst | active | password123 |

---

## 🚚 Vehicle Fleet
Overview of current assets.

| Name | Model | License Plate | Type | Status | Odometer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Vehicle Delhi-01 | Volvo FM 460 | DL01XX9999 | truck | available | 45,000 |
| Vehicle Delhi-02 | Tata LPT 2518 | DL02XX9999 | truck | available | 32,500 |
| Vehicle Mumbai-01 | Ashok Leyland AL 3210 | MH01XX9999 | truck | available | 67,890 |
| Vehicle Bangalore-01 | Eicher Pro 1084 | KA01XX9999 | truck | available | 28,500 |
| Vehicle Delhi-Van-01 | Maruti Super Carry | DL03XX9999 | van | in-shop | 12,000 |
| Vehicle Delhi-Bike-01 | Hero Splendor Plus | DL04XX9999 | bike | available | 5,000 |

---

## 👨‍💼 Driver Records
Tracking driver availability, safety scores, and licensing.

| Name | License No. | Category | Status | Safety Score | Trips | Expiry Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Rajesh Kumar | DLK0012345678 | HCV | on-duty | 98 | 234 | 2027-06-15 |
| Amit Patel | GJ1234567890 | HCV | on-duty | 95 | 189 | 2026-09-20 |
| Suresh Singh | MH5678901234 | HCV | off-duty | 92 | 156 | 2028-03-10 |
| Vikram Reddy | KA8901234567 | HCV | on-duty | 88 | 142 | 2026-05-15 |
| Priya Sharma | DL5555666677 | LCV | suspended | 45 | 23 | 2025-11-30 |

---

## 📦 Trip Logs
Current and historical movement data.

| Start Point | End Point | Status | Cargo Weight | Vehicle ID |
| :--- | :--- | :--- | :--- | :--- |
| Delhi Warehouse | Mumbai Dist. Center | completed | 18,000 kg | Vehicle Delhi-01 |
| Delhi Factory | Bangalore Depot | completed | 15,000 kg | Vehicle Delhi-02 |
| Mumbai Port | Pune Market | dispatched | 12,000 kg | Vehicle Mumbai-01 |
| Bangalore Hub | Hyderabad Center | draft | 8,000 kg | Vehicle Bangalore-01 |

---

## 🔧 Maintenance & Expenses
Financial and technical upkeep logs.

### Maintenance Records
| Vehicle | Type | Cost | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| Delhi-Van-01 | preventative | ₹5,000 | in-progress | Engine oil/filter replacement |
| Delhi-01 | reactive | ₹12,000 | completed | Brake pad replacement |
| Delhi-02 | preventative | ₹3,000 | scheduled | Tire rotation/air check |
| Mumbai-01 | emergency | ₹18,000 | completed | Cooling system flush |

### Expense Tracking
| Vehicle | Type | Amount | Date | Description |
| :--- | :--- | :--- | :--- | :--- |
| Delhi-01 | fuel | ₹8,500 | 2026-02-19 | Diesel - Delhi to Mumbai |
| Delhi-01 | fuel | ₹7,200 | 2026-02-20 | Diesel - Return trip |
| Delhi-02 | fuel | ₹6,500 | 2026-02-18 | Diesel - Delhi to Bangalore |
| Delhi-02 | maintenance | ₹8,000 | 2026-02-15 | Transmission fluid change |

---

## 📊 Dashboard Summary
| Metric | Current Value |
| :--- | :--- |
| Active Fleet Count | 5 |
| Maintenance Alerts | 1 |
| Fleet Utilization Rate | 66.67% |
| Pending Cargo Trips | 1 |