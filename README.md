# Hospital Token Management System (CareToken)

A complete, responsive, full-stack Hospital Token and Queue Management System designed to eliminate manual paper queues, reduce outpatient congestion, and streamline patient-doctor consultations.

---

## 1. Project Overview

CareToken is a modern healthcare web application that replaces manual ticket issuance with an atomic, digital token management workflow. Patients can book specialist consultations online, receive sequentially numbered tokens (e.g., `CARD-001`, `PEDI-002`), track their dynamic queue positions and estimated wait times in real time, and view public waiting-room status displays.

Medical professionals and hospital receptionists manage live queues with transition controls (`WAITING` &rarr; `CALLED` &rarr; `IN_CONSULTATION` &rarr; `COMPLETED` / `SKIPPED` / `RECALLED` / `CANCELLED`), with instant WebSocket synchronization powered by Socket.IO.

---

## 2. User Roles & Capabilities

### A. Patient
* **Self-Registration & Authentication:** Secure patient account registration with JWT session tokens.
* **Specialist Directory:** Browse clinical departments, doctor bios, consultation durations, and room numbers.
* **Appointment Booking:** View verified doctor time slots excluding break hours and book routine, follow-up, or urgent visits.
* **Sequential Digital Tokens:** Automatically receive department-specific tokens (e.g., `CARD-001`).
* **Live Queue Status:** Track queue position (`#X ahead in line`) and estimated waiting minutes calculated dynamically.
* **Receipt Slips:** Printable token slips for hospital physical check-in.
* **Notifications:** Receive instant in-app and socket alerts when tokens are called or updated.
* **Appointment History & Cancellations:** View previous consultations and cancel eligible bookings.

### B. Doctor
* **Secure Console:** Protected doctor dashboard showing today's appointment load, patients waiting, and current consultations.
* **Patient Queue Controller:** Interactive action buttons:
  - **Call Patient:** Dispatches real-time notification to patient and updates public lobby boards.
  - **Start Consultation:** Marks token as `IN_CONSULTATION`.
  - **Complete Consultation:** Records medical/prescription notes and marks consultation completed.
  - **Skip Patient:** Safely moves absent patient aside into `SKIPPED` state.
  - **Recall Patient:** Restores skipped patient to active calling status.
* **Schedule Management:** Configure active clinic days, opening hours, break times, and slot duration.

### C. Receptionist
* **Walk-In Registration:** Register on-site walk-in patients arriving without an online account.
* **Staff-Assisted Booking:** Book appointments and issue tokens on behalf of patients.
* **Active Queue Coordination:** Monitor live queues across all hospital departments simultaneously.
* **Token Receipt Printing:** Print thermal/slip receipts formatted for waiting patients.

### D. Administrator
* **Hospital Command Center:** Hospital-wide operational statistics, daily booking rates, and department throughput.
* **Doctor Management:** Create doctor credentials, assign departments, room numbers, and consultation intervals.
* **Patient Records:** Search and inspect patient records and historical consultations.
* **Staff Management:** Securely provision receptionist and administrative accounts.
* **Department Management:** Add/edit clinical departments and configure daily token quotas.
* **Appointment Management:** Global oversight of all hospital bookings with cancellation controls.
* **Queue Monitoring & Reports:** Real-time multi-department monitoring and quota utilization charts.
* **Hospital Settings:** Update hospital name, emergency hotline, operating hours, and consultation defaults.
* **Audit & Activity Logs:** Non-sensitive security audit trail recording all user logins and token transitions.

---

## 3. Technology Stack

* **Frontend:** React.js 18, Vite 6, React Router DOM 6, Lucide React (Icons), Axios, Socket.IO Client.
* **Frontend Design:** Custom pure CSS theme (hospital-tailored: clean white backgrounds with blue, teal, and slate accents; responsive cards, badges, and print styles).
* **Backend:** Node.js, Express.js (REST API, Helmet, CORS, Morgan, Express Rate Limit, Express Validator).
* **Real-Time Layer:** Socket.IO for bidirectional queue events and room-based broadcasting.
* **Database & ORM:** MongoDB with Mongoose (schemas, compound indexes, atomic sequence counters).
* **Authentication & Security:** JSON Web Tokens (JWT), bcrypt password hashing, role-based authorization middleware.
* **Testing:** Jest, Supertest.

---

## 4. Project Folder Structure

```
elegant-bell/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Badge, Button, Card, Modal, StatCard, QueueTicketCard, PrintReceiptModal
│   │   │   └── layout/             # Navbar, Footer, Sidebar, DashboardLayout, ProtectedRoute, NotificationDropdown
│   │   ├── context/                # AuthContext (sessions), SocketContext (real-time queue sync)
│   │   ├── pages/
│   │   │   ├── public/             # Home, About, Departments, Doctors, DoctorProfile, Login, Register, Contact, PublicLiveQueue
│   │   │   ├── patient/            # Dashboard, BookAppointment, Confirmation, MyTokens, History, Profile
│   │   │   ├── doctor/             # Dashboard, Appointments, QueueManagement, Schedule
│   │   │   ├── receptionist/       # Dashboard, WalkInRegistration, Booking, ActiveQueue
│   │   │   └── admin/              # Dashboard, Doctors, Patients, Staff, Departments, Appointments, Queues, Reports, Settings, Logs
│   │   ├── services/               # API service layer (api, auth, appointment, token, doctor, department, dashboard, admin)
│   │   ├── styles/                 # index.css (complete hospital styling & print styles)
│   │   ├── App.jsx                 # Client router with role-based routing
│   │   └── main.jsx                # React DOM entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── database.js             # Mongoose connection with strict MONGODB_URI check
│   ├── controllers/                # Auth, Patient, Doctor, Department, Appointment, Token, Dashboard, Notification, ActivityLog, Setting
│   ├── middleware/                 # authMiddleware, roleMiddleware, rateLimiter, errorHandler
│   ├── models/                     # User, Patient, Doctor, Department, Appointment, Token, TokenSequence, DoctorSchedule, Notification, ActivityLog, HospitalSetting
│   ├── routes/                     # Express route definitions
│   ├── scripts/
│   │   ├── seedAdmin.js            # Secure initial administrator creation script
│   │   └── seedDemoData.js         # Comprehensive demo departments, doctors, and demo users
│   ├── services/
│   │   ├── tokenService.js         # Concurrency-safe atomic token issuance, state machine, queue & wait calculations
│   │   └── appointmentService.js   # Slot generator, break exclusions, double-booking prevention
│   ├── sockets/
│   │   └── queueSocket.js          # Room-based Socket.IO dispatchers
│   ├── tests/                      # Automated unit tests for auth, token state transitions, and appointment slots
│   ├── utils/                      # JWT helpers, activityLogger
│   ├── .env.example                # Backend environment template (MONGODB_URI=null)
│   ├── .gitignore
│   ├── app.js                      # Express configuration and routes mounting
│   ├── server.js                   # HTTP server & Socket.IO listener
│   └── package.json
│
├── package.json                    # Workspace orchestration scripts
├── README.md                       # Complete documentation
└── .gitignore                      # Git ignore file
```

---

## 5. Prerequisites

Before running the application, ensure you have:
* **Node.js:** v18.0.0 or later (Tested on Node v24).
* **npm:** v9.0.0 or later.
* **MongoDB:** A running MongoDB instance (Local MongoDB Community Server or MongoDB Atlas cloud cluster).

---

## 6. Installation & Setup

### Clone Repository & Install Dependencies

From the repository root directory, run:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## 7. MongoDB Connection Configuration

> **IMPORTANT REQUIREMENT:** As specified, the default connection string in configuration is empty and null:
> `MONGODB_URI=null`
> You must create a `.env` file in the `server/` directory and replace this placeholder with your actual MongoDB connection string.

### Backend `.env` Setup

1. In the `server/` folder, copy the `.env.example` template:

   ```bash
   cd server
   cp .env.example .env
   ```

2. Open `server/.env` and configure your credentials:

   ```env
   # Replace 'null' with your actual MongoDB connection URI:
   MONGODB_URI=mongodb://localhost:27017/hospital_token_db
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospital_token_db?retryWrites=true&w=majority

   PORT=5000
   JWT_SECRET=your_super_secret_jwt_random_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

> If `MONGODB_URI` is left unconfigured or set to `'null'`, the server will deliberately abort on startup with a clear error:
> `SERVER INITIALIZATION ERROR: MONGODB_URI is not configured. Set it in the backend .env file.`

### Frontend `.env` Setup

1. In the `client/` folder, copy `.env.example`:

   ```bash
   cd client
   cp .env.example .env
   ```

2. `client/.env` contains:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

---

## 8. Database Seeding & Administrator Creation

### Step 1: Create Initial Administrator Securely

Once your MongoDB connection is configured in `server/.env`, create the first administrator account:

```bash
cd server
npm run seed:admin
```

This generates an initial administrator account:
* **Email:** `admin@hospital.org`
* **Password:** `Admin@Secure2026`
* **Role:** `admin`

### Step 2: Seed Demo Clinical Departments, Doctors & Accounts (Recommended)

To populate standard clinical departments (Cardiology, Pediatrics, General Medicine, Orthopedics, Dermatology), practicing doctors, schedules, and test accounts:

```bash
cd server
npm run seed:demo
```

This creates the following ready-to-test accounts (All passwords: `Hospital@123`):
1. **Admin:** `admin@hospital.org`
2. **Receptionist:** `receptionist@hospital.org`
3. **Cardiologist (Doctor):** `doctor.vance@hospital.org`
4. **Pediatrician (Doctor):** `doctor.rostova@hospital.org`
5. **General Physician (Doctor):** `doctor.brody@hospital.org`
6. **Patient:** `patient@hospital.org`

*(Note: The login page also features 1-click demo credential autofill buttons for immediate testing!)*

---

## 9. Starting the Applications

### Start Backend API Server

```bash
cd server
npm run dev
# Or production mode:
npm start
```
The server will start at `http://localhost:5000`.

### Start Frontend React Client

In a separate terminal:

```bash
cd client
npm run dev
```
The client will start at `http://localhost:5173`. Open this URL in your browser.

---

## 10. Automated Tests

Automated unit and integration test suites cover authentication, token state transition matrix, atomic token sequence formatting, dynamic queue waiting calculations, and double-booking slot algorithms.

Run the test suite with:

```bash
cd server
npm test
```

Expected output:
```text
PASS tests/appointmentLogic.test.js
PASS tests/tokenLogic.test.js
PASS tests/auth.test.js

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
Snapshots:   0 total
```

---

## 11. REST API Endpoint Documentation

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <JWT>`.

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Public patient self-registration.
* `POST /api/auth/login` - Authenticate patient, doctor, receptionist, or admin.
* `POST /api/auth/logout` - Clear session.
* `GET /api/auth/me` - Fetch profile of currently authenticated user.
* `POST /api/auth/register-staff` - *(Admin Only)* Create doctor, receptionist, or admin accounts.

### Patients (`/api/patients`)
* `GET /api/patients` - *(Staff)* List & search patient directory.
* `GET /api/patients/:id` - Get patient profile.
* `POST /api/patients` - *(Receptionist/Admin)* Register on-site walk-in patient.
* `PUT /api/patients/:id` - Update patient details.
* `GET /api/patients/:id/appointments` - Get patient appointment history.
* `GET /api/patients/:id/tokens` - Get patient tokens with queue positions.

### Doctors (`/api/doctors`)
* `GET /api/doctors` - Directory of doctors (supports `?departmentId=` and `?search=`).
* `GET /api/doctors/:id` - Detailed doctor profile.
* `PUT /api/doctors/:id` - Update doctor profile (Admin or the doctor).
* `GET /api/doctors/:id/appointments` - Doctor's appointments for given date.
* `GET /api/doctors/:id/queue` - Doctor's active waiting queue.
* `GET /api/doctors/:id/schedule` - Doctor's weekly clinic schedule.
* `PUT /api/doctors/:id/schedule` - Update doctor's weekly clinic schedule.

### Departments (`/api/departments`)
* `GET /api/departments` - List active outpatient departments.
* `GET /api/departments/:id` - Get department details.
* `POST /api/departments` - *(Admin Only)* Create department.
* `PUT /api/departments/:id` - *(Admin Only)* Update department details or token limits.
* `DELETE /api/departments/:id` - *(Admin Only)* Soft-deactivate department.

### Appointments (`/api/appointments`)
* `GET /api/appointments/available-slots?doctorId=X&date=YYYY-MM-DD` - Query available time slots.
* `POST /api/appointments` - Book appointment and automatically issue token.
* `GET /api/appointments` - List appointments with role-scoped filters.
* `GET /api/appointments/:id` - Get appointment details.
* `PATCH /api/appointments/:id/cancel` - Cancel appointment and its active token.

### Tokens (`/api/tokens`)
* `GET /api/tokens/track/:id` - Public lookup of a token's status.
* `GET /api/tokens/queue/:departmentId` - Live department queue roster for displays.
* `GET /api/tokens/my-tokens` - Current patient's tokens with queue positions.
* `GET /api/tokens/:id` - Token details with dynamic queue calculation.
* `POST /api/tokens` - *(Receptionist/Admin)* Issue manual/walk-in token.
* `PATCH /api/tokens/:id/call` - *(Doctor/Receptionist)* Transition token to `CALLED`.
* `PATCH /api/tokens/:id/start-consultation` - *(Doctor)* Transition token to `IN_CONSULTATION`.
* `PATCH /api/tokens/:id/complete` - *(Doctor)* Transition token to `COMPLETED` with notes.
* `PATCH /api/tokens/:id/skip` - *(Doctor)* Transition token to `SKIPPED`.
* `PATCH /api/tokens/:id/recall` - *(Doctor/Receptionist)* Transition skipped token back to `CALLED`.
* `PATCH /api/tokens/:id/cancel` - Cancel active token.

### Dashboards (`/api/dashboard`)
* `GET /api/dashboard/admin` - Hospital statistics, department utilization, audit events.
* `GET /api/dashboard/doctor` - Current consultations, next patient, waiting queue.
* `GET /api/dashboard/receptionist` - Walk-in count, active tokens, department queues.
* `GET /api/dashboard/patient` - Patient's active token, queue position, next appointment.

### Notifications & Audit (`/api/notifications`, `/api/activity-logs`, `/api/settings`)
* `GET /api/notifications` - User notifications.
* `PATCH /api/notifications/:id/read` - Mark notification as read.
* `PATCH /api/notifications/read-all` - Mark all notifications as read.
* `GET /api/activity-logs` - *(Admin Only)* Security audit trail.
* `GET /api/settings` - Public hospital info & operating hours.
* `PUT /api/settings` - *(Admin Only)* Update hospital info & defaults.

---

## 12. Token Numbering & State Transition Mechanics

### Atomic Sequential Numbering
Token numbers are generated on the server using an atomic MongoDB sequence counter:
```javascript
TokenSequence.findOneAndUpdate(
  { departmentCode: deptCode, serviceDate: date },
  { $inc: { lastSequence: 1 } },
  { new: true, upsert: true }
)
```
This guarantees monotonic, sequential token numbers (e.g., `CARD-001`, `CARD-002`) and prevents race conditions or duplicates during concurrent bookings. Number sequences naturally reset per service date without altering historical records.

### State Transition Matrix
```
BOOKED ----------> WAITING ----------> CALLED ----------> IN_CONSULTATION ----------> COMPLETED [Terminal]
   |                  |                   |
   |                  +-----> SKIPPED <---+
   |                             |
   |                             +-----> (Recall to CALLED)
   |
   +-------------> CANCELLED [Terminal]
```

---

## 13. Common Troubleshooting

* **Server error: `MONGODB_URI is not configured`**
  - Ensure you created `server/.env` and replaced `MONGODB_URI=null` with a valid connection string.
* **CORS error on browser**
  - Verify `CLIENT_URL=http://localhost:5173` in `server/.env`.
* **Socket disconnects or fails**
  - Verify that the backend server is running on port 5000 and `VITE_SOCKET_URL=http://localhost:5000` is in `client/.env`.
  - The client automatically falls back to periodic polling if WebSockets are unavailable.

---

## 14. Feature Verification Checklist

| Feature | Verification Method | Status |
| :--- | :--- | :--- |
| **Authentication & RBAC** | Self-register as patient, log in as Doctor, Receptionist, or Admin. Unauthorized pages blocked. | Verified |
| **Atomic Token Generation** | Consecutive bookings in same department yield sequential IDs (`CARD-001`, `CARD-002`). | Verified |
| **Double-Booking Prevention** | Attempting to book the same doctor slot returns HTTP 409 conflict. | Verified |
| **Dynamic Queue Position** | Cancelling or completing tokens immediately recalculates queue positions ahead. | Verified |
| **Doctor Queue Controls** | Doctor can Call, Start Consultation, Complete with Notes, Skip, and Recall. | Verified |
| **Real-time Live Displays** | Public queue display updates immediately when doctor calls patient via Socket.IO. | Verified |
| **Slip Printing** | Printable receipt modal renders formatted 80mm slip for thermal or browser printing. | Verified |
| **Audit Logging** | Admin activity logs reflect logins, cancellations, and doctor token actions. | Verified |
