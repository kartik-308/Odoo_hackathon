# 🚚 TransitOps — Smart Transport Operations Platform

> Built for the Odoo Hackathon (8-Hour Challenge)

TransitOps is a centralized, end-to-end transport operations platform that digitizes vehicle management, driver compliance, trip dispatch, maintenance workflows, fuel tracking, and financial analytics — all in one responsive web app with role-based access control.

---

## 🖥️ Live Demo

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `admin@transitops.com` | `admin123` |
| Driver | `driver@transitops.com` | `driver123` |
| Safety Officer | `safety@transitops.com` | `safety123` |
| Financial Analyst | `finance@transitops.com` | `finance123` |

---

## ✨ Features

### Core Modules
| Module | Description |
|--------|-------------|
| **Dashboard** | Live KPIs — Active Vehicles, Available Vehicles, In Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%). Charts: Vehicle Status Distribution & Trip Activity |
| **Vehicle Registry** | Full CRUD for fleet vehicles with Registration Number, Type, Max Load, Odometer, Acquisition Cost, Status, and Region. Filter by type & status |
| **Driver Management** | Driver profiles with license tracking, expiry alerts, safety scores, and compliance status. Filter by status |
| **Trip Dispatcher** | Create → Dispatch → Complete / Cancel lifecycle with full business rule validation |
| **Maintenance** | Maintenance log creation automatically puts vehicle "In Shop". Closing a record restores the vehicle to "Available" |
| **Fuel & Expenses** | Manual fuel log entry, expense tracking (tolls, parking, etc.), and per-vehicle operational cost breakdown |
| **Reports & Analytics** | Fuel efficiency, fleet utilization, cost breakdown charts, revenue vs cost per vehicle, ROI calculation |
| **Settings & RBAC** | User management, role assignment, and live permissions matrix |

### Quality-of-Life Features
- 🔍 **Live Global Search** — Search vehicles, drivers, and trips from the header bar with instant dropdown results
- 🔔 **Notification Center** — Bell icon shows alerts for expired/expiring licenses, active maintenance, and dispatched trips
- 🌙 **Dark / Light Mode** — Persisted theme toggle
- 📤 **CSV & PDF Export** — Export vehicles, drivers, trips, and full fleet reports
- 📱 **Responsive Design** — Works on mobile with a collapsible sidebar

---

## 🔐 Role-Based Access Control (RBAC)

| Module | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|--------|:---:|:---:|:---:|:---:|
| Dashboard | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Vehicles | ✅ Full | 👁️ View | 👁️ View | 👁️ View |
| Drivers | ✅ Full | 👁️ View | ✅ Full | 👁️ View |
| Trips | ✅ Full | ✅ Full | 👁️ View | 👁️ View |
| Maintenance | ✅ Full | 👁️ View | 👁️ View | 👁️ View |
| Fuel & Expenses | ✅ Full | ✅ Full | 👁️ View | ✅ Full |
| Reports | ✅ Full | 👁️ View | ✅ Full | ✅ Full |
| Settings | ✅ Full | ❌ None | ❌ None | ❌ None |

> View-only users see data but all Create / Edit / Delete buttons are hidden and a "View Only" banner is shown.

---

## ⚙️ Mandatory Business Rules

- Vehicle registration numbers are **unique**
- **Retired** or **In Shop** vehicles never appear in the dispatch pool
- Drivers with **expired licenses** or **Suspended** status cannot be assigned to trips
- A driver or vehicle already marked **On Trip** cannot be assigned to another trip
- **Cargo weight** must not exceed the vehicle's maximum load capacity
- Dispatching a trip → both vehicle & driver status become **On Trip**
- Completing a trip → both vehicle & driver status return to **Available**
- Cancelling a dispatched trip → vehicle & driver restored to **Available**
- Creating a maintenance record → vehicle status becomes **In Shop**
- Closing maintenance → vehicle restored to **Available** (unless Retired)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML + JavaScript (ES Modules) |
| Styling | Vanilla CSS with CSS Custom Properties (dark/light themes) |
| Build Tool | Vite v6 |
| Charts | Chart.js v4 |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Data Storage | Browser localStorage (no backend required) |
| Icons | Google Material Icons Round |
| Fonts | Google Fonts — Inter |

---

## 📦 Setup & Run

```bash
# 1. Clone the repository
git clone https://github.com/kartik-308/Odoo_hackathon.git
cd Odoo_hackathon

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
OdooHackathon/
├── index.html              # App entry point
├── package.json
├── src/
│   ├── main.js             # App shell, routing, global search, notifications
│   ├── store.js            # localStorage data layer + RBAC permissions
│   ├── style.css           # Full design system (dark/light themes)
│   ├── utils.js            # Shared helpers (toast, formatDate, CSV export, etc.)
│   └── pages/
│       ├── dashboard.js    # KPI cards + Chart.js charts
│       ├── vehicles.js     # Vehicle CRUD + filters
│       ├── drivers.js      # Driver CRUD + license compliance
│       ├── trips.js        # Trip lifecycle management
│       ├── maintenance.js  # Maintenance workflow
│       ├── fuel.js         # Fuel logs + expense tracking
│       ├── reports.js      # Analytics + PDF/CSV export
│       └── settings.js     # User management + RBAC matrix
```

---

## 📋 Example Walkthrough

This follows the exact workflow from the problem statement:

### Step 1 — Register a Vehicle
1. Login as **Fleet Manager** (`admin@transitops.com`)
2. Navigate to **Vehicles** → click **Add Vehicle**
3. Fill in: Reg Number `VAN-05`, Model `Ford Transit`, Type `Van`, Max Load `500`, Status `Available`
4. Click **Add Vehicle** — the vehicle appears in the registry

### Step 2 — Register a Driver
1. Navigate to **Drivers** → click **Add Driver**
2. Fill in: Name `Alex`, License Number `DL-2026-010`, Category `Light Vehicle`, valid expiry date, Safety Score `85`
3. Click **Add Driver** — driver is listed with a green score bar

### Step 3 — Create a Trip
1. Navigate to **Trips** → click **New Trip**
2. Select `VAN-05` as the vehicle and `Alex` as the driver
3. Enter Cargo Weight `450 kg`, Planned Distance `300 km`, Revenue `$2000`
4. Click **Create Trip** — trip is saved as **Draft**

> ✅ System validates: 450 kg ≤ 500 kg (max load) — allowed

### Step 4 — Dispatch the Trip
1. In the trips table, click the green **Send** button on the Draft trip
2. Trip status → **Dispatched**
3. Vehicle `VAN-05` status → **On Trip**
4. Driver `Alex` status → **On Trip**

> Both are now removed from the dispatch selection pool automatically

### Step 5 — Complete the Trip
1. Click the blue **Check** button on the Dispatched trip
2. Enter Final Odometer and Fuel Consumed (e.g. `55` liters)
3. Click **Complete Trip**
4. Trip status → **Completed** | Vehicle & Driver → **Available**
5. A fuel log is automatically created for the consumed fuel

### Step 6 — Log Maintenance
1. Navigate to **Maintenance** → click **Add Record**
2. Select `VAN-05`, choose type `Oil Change`, enter cost `$250`
3. Click **Create Record**
4. Vehicle `VAN-05` status → **In Shop** (hidden from dispatch pool automatically)

### Step 7 — Check Reports
1. Navigate to **Reports & Analytics**
2. View updated Fuel Efficiency, Total Operational Cost, Revenue, and Vehicle ROI
3. Click **Export PDF** to download a full fleet performance report

---

## 👥 Team

Built during the Odoo Hackathon — 8-hour challenge.
