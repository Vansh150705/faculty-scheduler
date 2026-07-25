# 📅 Faculty Scheduler

A full-stack MERN application for booking office-hour appointments between university **students** and **faculty**, with role-based dashboards, real-time-ish in-app notifications, analytics, and a full admin panel.

> Faculty publish weekly availability → the app expands it into bookable slots → students book, reschedule, or cancel → everyone stays in sync with notifications and email.

---

## ✨ Features

### For students
- Browse a searchable **faculty directory** (by name / department)
- Pick a date and book from **auto-generated time slots** (taken slots are disabled)
- Add a **reason** to each request
- **Reschedule** or **cancel** your own bookings
- **List** and **month calendar** views of your appointments
- Export appointments to **CSV** or **.ics** (import into Google/Apple/Outlook)

### For faculty
- Define weekly **availability** with configurable slot length (15–60 min)
- **Confirm / decline / complete** appointment requests
- **Filter** by status and switch between list & calendar views
- **Double-booking is prevented** at the API level
- Personal **analytics** — totals, upcoming, weekday distribution

### For admins
- System-wide **dashboard** with user & appointment metrics
- **User management** — search, filter, change roles, delete users (cascades related records)
- "Most booked faculty" leaderboard

### Everywhere
- 🔐 JWT auth with bcrypt-hashed passwords and role-based access control
- 🔔 In-app **notification bell** with unread badge + email notifications
- 🌗 **Dark mode** (persisted, respects OS preference)
- 🍞 Non-blocking **toast** notifications
- 📊 Server-side aggregation for all analytics — **no AI / no third-party APIs**

---

## 🧱 Tech stack

| Layer     | Tech                                                             |
| --------- | --------------------------------------------------------------- |
| Frontend  | React 19, Vite, React Router 7, Tailwind CSS 3, Axios, lucide-react |
| Backend   | Node.js, Express 5, Mongoose 8, JWT, bcryptjs, Nodemailer       |
| Database  | MongoDB                                                         |

---

## 📂 Structure

```
FacultyScheduler/
├── backend/     Express REST API  (see backend/README.md for full API docs)
└── frontend/    React + Vite single-page app
```

---

## 🚀 Getting started

**Prerequisites:** Node.js 18+, a running MongoDB instance.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm run seed                # optional: demo users + data
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # defaults to http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

### Demo accounts (after `npm run seed`)

All use the password **`password123`**:

| Role    | Email                                            |
| ------- | ------------------------------------------------ |
| Admin   | `admin@demo.edu`                                 |
| Faculty | `anderson@demo.edu`, `chen@demo.edu`, `garcia@demo.edu` |
| Student | `alice@demo.edu`, `bob@demo.edu`, `carol@demo.edu` |

---

## 🔌 API overview

Full reference in [`backend/README.md`](backend/README.md).

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/auth/faculty` · `PUT /api/auth/profile` · `PUT /api/auth/password`
- `GET/POST/DELETE /api/availability` · `GET /api/availability/:id/slots`
- `POST/GET /api/appointments` · `PUT /api/appointments/:id/status` · `PUT /api/appointments/:id/reschedule` · `DELETE /api/appointments/:id`
- `GET /api/notifications` · `PUT /api/notifications/:id/read` · `PUT /api/notifications/read-all`
- `GET /api/stats` · `GET/PUT/DELETE /api/admin/users`

---

## 📝 License

Released under the [MIT License](LICENSE).
