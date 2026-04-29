# Faculty Scheduler (Frontend)

A premium, world-class scheduling platform designed exclusively for university faculty and students. This frontend application is built with modern React (Vite) and features a state-of-the-art UI with advanced glassmorphism, dynamic animations, and a sleek Light Mode aesthetic.

## 🌟 Key Features

- **Premium UI/UX:** High-end, custom vanilla CSS architecture featuring multi-layered box shadows, mesh gradients, and frosted glass elements.
- **Dynamic Animations:** Staggered reveal animations, floating elements, and smooth transitions for a highly interactive experience.
- **Role-Based Routing:** Seamlessly transition between Student, Faculty, and Admin dashboards depending on your authenticated role.
- **Faculty Dashboard:** Manage office hours, define weekly availability, and instantly accept or reject student appointment requests.
- **Student Dashboard:** Search for available faculty members, view their specific availability, and book appointments step-by-step.
- **Responsive Design:** Fully responsive layout that looks incredible on both mobile devices and large desktop monitors.

## 🛠️ Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite (for lightning-fast HMR and optimized production builds)
- **Styling:** Custom Vanilla CSS with modern variables and glassmorphism utilities (No heavy CSS frameworks)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **HTTP Client:** Axios

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You need Node.js and npm installed on your machine.
- [Node.js](https://nodejs.org/en/) (v16.0.0 or higher recommended)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## 📁 Folder Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, SVGs, etc.
│   ├── components/       # Reusable UI components (Navbar, etc.)
│   ├── context/          # React Context providers (AuthContext)
│   ├── pages/            # Page-level components
│   │   ├── Dashboard.jsx
│   │   ├── FacultyScheduler.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── StudentBooking.jsx
│   ├── App.jsx           # Main application routing and wrapper
│   ├── index.css         # Global design system, animations, and typography
│   └── main.jsx          # React entry point
├── package.json          # Project dependencies and scripts
└── vite.config.js        # Vite configuration
```

## 🎨 Design System

The application relies heavily on a custom CSS design system defined in `index.css`. Key concepts include:

- **`.glass-panel` / `.glass-card`:** Core utility classes for creating frosted glass effects with dynamic blur and shadow layers.
- **`.auth-split`:** A premium, split-screen layout for authentication pages.
- **Custom Scrollbars & Badges:** Attention to detail across every interactive element.
- **Typography:** Utilizing **Outfit** for bold, impactful headings and **Inter** for highly readable body text.

## 🔗 Backend Integration

This frontend expects a backend running locally at `http://localhost:5000`. Ensure your backend Express/MongoDB server is running concurrently for full functionality (authentication, booking slots, fetching data).
