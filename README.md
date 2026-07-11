# DevAcademy operations console

Welcome to **DevAcademy**, a unified learning and workforce management application. This portal bridges the gap between learning coding concepts and landing job placements, with distinct features for students, instructors, and platform administrators.

---

## 🔑 Demo Account Quick Access
To make testing simple, we've pre-configured three accounts with all authorization levels. You can sign in using these credentials or create a new custom account:

| Role | Email Address | Password | Focus Area |
| :--- | :--- | :--- | :--- |
| **Student** | `student@devacademy.edu` | `student123` | Interactive sandboxes, quizzes, resume building & jobs |
| **Instructor** | `instructor@devacademy.edu` | `instructor123` | Student stats tracking, live chat broadcasts |
| **Admin** | `admin@devacademy.edu` | `admin123` | System metrics, VM sandboxing controls, vacancy approvals |

---

## 🌟 Core Features

### 1. Student Learning Hub
- **Interactive Coding Sandbox**: Learn languages like Python or JavaScript with a real-time isolated execution engine that runs unit tests instantly.
- **Career Readiness Suite**: Create a tailored CV/portfolio using simple templates and practice technical coding interviews with an interactive simulated AI coach.
- **Live Classroom Activities**: Participate in real-time multiple-choice quizzes and watch instructor whiteboard streams.
- **Placement Dashboard**: Apply to verified job vacancies with dynamic matching scores.

### 2. Instructor Dashboard
- Monitor student track progress, streak completions, and challenge scores.
- Run interactive classroom lectures and view mock test performance.

### 3. Root Operations Admin
- **Compiler VM Configurations**: Manage memory allocations (64MB to 1024MB), execution timeout thresholds, and strict isolation controls for the sandboxed V8 execution.
- **Partner Verification Queue**: Inspect, approve, publish, or decline incoming job vacancy posts before they are published to students.
- **Audit Logging**: A simulated terminal logging feed monitoring real-time backend updates and student achievements.

---

## 🛠️ Technical Overview

The application is built using a modern full-stack architecture:
- **Frontend**: React (TypeScript) and Vite styled with high-contrast Tailwind CSS utility classes and Lucide icons.
- **Backend**: Express server (`server.ts`) hosting secure compiler routes, authentication API proxies, and placement queue operations.
- **Persistence**: High-speed offline-first JSON datastore with live system fallback mechanisms.

*Crafted for beautiful design, spacious negative boundaries, and responsive desktop-first precision.*
