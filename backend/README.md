# Faculty Scheduler — Backend API

REST API for the Faculty Scheduler platform, built with **Express 5**, **MongoDB / Mongoose 8**, and **JWT** authentication.

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values
npm run seed              # optional: load demo data
npm run dev               # start with auto-reload (node --watch)
```

The server starts on `http://localhost:5000` (configurable via `PORT`).

## Environment

| Variable        | Required | Description                                  |
| --------------- | :------: | -------------------------------------------- |
| `MONGO_URI`     |   yes    | MongoDB connection string                    |
| `JWT_SECRET`    |   yes    | Secret used to sign auth tokens              |
| `PORT`          |    no    | Server port (default `5000`)                 |
| `CLIENT_URL`    |    no    | Allowed CORS origin (default Vite dev URL)   |
| `JWT_EXPIRES_IN`|    no    | Token lifetime (default `1d`)                |
| `EMAIL_USER` / `EMAIL_PASS` | no | Gmail creds; blank falls back to console logging |

Missing a required variable exits the process with a clear message.

## Architecture

```
backend/
├── config/       env validation + Mongo connection
├── controllers/  request handlers (auth, appointments, availability, notifications, stats, admin)
├── middleware/   auth, role guard, rate limiter, security headers, logger, error handler
├── models/       Mongoose schemas (User, Appointment, Availability, Notification)
├── routes/       route definitions
├── utils/        asyncHandler, ApiError, validators, mailer, notify
└── server.js     app bootstrap
```

Controllers are wrapped in `asyncHandler`, so thrown `ApiError`s and rejected
promises are funnelled into a single error-handling middleware that returns a
consistent `{ message, details? }` JSON shape.

## API reference

All protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`
| Method | Path         | Access  | Description                       |
| ------ | ------------ | ------- | --------------------------------- |
| POST   | `/register`  | public  | Create an account                 |
| POST   | `/login`     | public  | Obtain a JWT                      |
| GET    | `/me`        | auth    | Current user profile              |
| GET    | `/faculty`   | auth    | Faculty directory (`?search=`)    |
| PUT    | `/profile`   | auth    | Update editable profile fields    |
| PUT    | `/password`  | auth    | Change password                   |

### Availability — `/api/availability`
| Method | Path                 | Access   | Description                          |
| ------ | -------------------- | -------- | ------------------------------------ |
| POST   | `/`                  | faculty  | Add a weekly slot                    |
| GET    | `/`                  | auth     | All availability                     |
| GET    | `/:facultyId`        | auth     | A faculty member's availability      |
| GET    | `/:facultyId/slots`  | auth     | Bookable slots for `?date=` (taken flagged) |
| DELETE | `/:id`               | faculty/admin | Remove a slot                   |

### Appointments — `/api/appointments`
| Method | Path             | Access        | Description                          |
| ------ | ---------------- | ------------- | ------------------------------------ |
| POST   | `/`              | student       | Book (double-booking prevented)      |
| GET    | `/`              | auth          | Role-scoped list (`?status=`, `?upcoming=true`) |
| PUT    | `/:id/status`    | faculty/admin | Confirm / cancel / complete          |
| PUT    | `/:id/reschedule`| student       | Move own appointment                 |
| DELETE | `/:id`           | student       | Cancel own appointment               |

### Waitlist — `/api/waitlist`
| Method | Path      | Access  | Description                                   |
| ------ | --------- | ------- | --------------------------------------------- |
| POST   | `/`       | student | Join the waitlist for a taken slot            |
| GET    | `/mine`   | student | Active waitlist entries                       |
| DELETE | `/:id`    | student | Leave the waitlist                            |

> When an appointment is cancelled, students waiting on that exact slot are
> automatically notified (in-app + email) that it has opened up.

### Notifications — `/api/notifications`
| Method | Path         | Access | Description                    |
| ------ | ------------ | ------ | ------------------------------ |
| GET    | `/`          | auth   | List + unread count            |
| PUT    | `/:id/read`  | auth   | Mark one read                  |
| PUT    | `/read-all`  | auth   | Mark all read                  |

### Stats & Admin
| Method | Path                    | Access | Description                     |
| ------ | ----------------------- | ------ | ------------------------------- |
| GET    | `/api/stats`            | auth   | Role-tailored summary metrics   |
| GET    | `/api/stats/analytics`  | auth   | Chart-ready time series (monthly, hourly, weekday, status) |
| GET    | `/api/admin/users`      | admin  | List users (`?role=`, `?search=`) |
| PUT    | `/api/admin/users/:id/role` | admin | Change a user's role         |
| DELETE | `/api/admin/users/:id`  | admin  | Delete a user + related records |
| GET    | `/api/health`           | public | Liveness / DB status            |

## Security notes
- Passwords hashed with bcrypt; the hash is stripped from every JSON response.
- Credential routes are rate-limited (in-memory fixed window).
- Baseline security headers set on every response.
