# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- Central config module, MongoDB connection helper, and health-check endpoint
- Central error handling, `asyncHandler`, and `ApiError` helpers
- Role-based authorization middleware and input validation helpers
- Faculty profiles, `/me`, profile update, and change-password endpoints
- Double-booking prevention, appointment cancel and reschedule
- Bookable-slot generation from weekly availability
- In-app notifications with unread counts and email fallback
- Role-based analytics (`/api/stats`) and admin user management
- In-memory rate limiter, baseline security headers, and a seed script
- Tailwind CSS styling, dark mode, toast notifications, and a central API client
- Notification bell, profile page, admin dashboard, and stat cards
- Month calendar view and CSV / iCalendar export
- Error boundary, scroll-to-top, footer, and reusable empty/skeleton states

### Changed
- Removed leftover Create React App files
- Dropped deprecated Mongoose connection options

### Security
- Hardened CSV/ICS export against formula and injection attacks
- Passwords stripped from all API responses
