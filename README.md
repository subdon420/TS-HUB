# 🚀 Tester's Home — QA & Developer Collaboration Platform

> **Where Bugs Meet Their Demise.**  
> A high-performance, cyberpunk dark-mode collaboration platform built specifically for Quality Assurance (QA) engineers and software developers to execute test runs, log bugs with AI polish, record reproduction clips, and sync PRs via webhooks.

---

## 🧭 1. MongoDB Compass Integration & Database Details

This application is configured out of the box to connect directly to your local **MongoDB** server. All documents are structured and viewable directly in **MongoDB Compass**.

### Connection String for MongoDB Compass:
```
mongodb://127.0.0.1:27017
```
*(or `mongodb://localhost:27017`)*

### Database Name:
```
testers_home
```

### Collections in MongoDB Compass:
| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| `users` | QA Engineers, Developers, and Leads | `name`, `email`, `role`, `title`, `avatar` |
| `workspaces` | Team collaboration hubs | `name`, `code`, `owner`, `members` |
| `projects` | Code repositories and QA workspaces | `name`, `key`, `healthScore`, `repositoryUrl` |
| `bugs` | Defects tracking across lifecycle stages | `key`, `status`, `severity`, `priority`, `reproductionSteps`, `gitPrLink` |
| `testsuites` | Module-level test suite groupings | `title`, `description`, `project` |
| `testcases` | Individual step-by-step test instructions | `key`, `suite`, `preconditions`, `steps`, `expectedOutcome` |
| `testruns` | Execution cycles with Pass/Fail results | `runNumber`, `status`, `results`, `passedCount`, `failedCount` |
| `activitylogs` | Real-time audit and collaboration event stream | `action`, `message`, `user`, `entityType` |
| `comments` | Inline defect discussion threads | `content`, `codeSnippet`, `author` |

---

## 🏗️ 2. Clean & Structured Architecture

```
Testers Home/
├── backend/                              # Complete Express + Mongoose API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB connection to 127.0.0.1:27017
│   │   ├── models/                      # Strict Mongoose Schemas (Compass Native)
│   │   │   ├── User.js
│   │   │   ├── Workspace.js
│   │   │   ├── Project.js
│   │   │   ├── Bug.js                   # Bug lifecycle & Git PR linkage
│   │   │   ├── TestSuite.js
│   │   │   ├── TestCase.js              # Preconditions & execution steps
│   │   │   ├── TestRun.js               # Auto-bug link on failure
│   │   │   ├── ActivityLog.js           # Realtime event stream
│   │   │   └── Comment.js               # Inline discussions & code snippets
│   │   ├── controllers/                 # Business logic & RBAC rules
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── bugController.js
│   │   │   ├── testSuiteController.js
│   │   │   ├── testRunController.js
│   │   │   ├── aiController.js          # AI Bug Report Polish engine
│   │   │   └── webhookController.js     # Git PR Webhook Sync
│   │   ├── routes/                      # REST API Endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── bugRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── webhookRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT & RBAC permission guards
│   │   │   └── uploadMiddleware.js      # Multer file uploads & recordings
│   │   ├── utils/
│   │   │   └── seedData.js              # Comprehensive demo dataset seeder
│   │   └── server.js                    # Server entrypoint with Socket.io
│   ├── .env                             # Port 5000, Mongo URI, JWT secret
│   └── package.json
│
├── frontend/                             # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx           # Role switcher badge & Compass status
│   │   │   │   └── CommandPalette.jsx   # Ctrl + K rapid navigator
│   │   │   ├── ui/
│   │   │   │   ├── NeonBadge.jsx        # Cyberpunk status & severity indicators
│   │   │   │   ├── GlassCard.jsx        # Glassmorphic containers
│   │   │   │   ├── Modal.jsx            # Backdrop blur modal dialogs
│   │   │   │   └── ScreenRecorderModal.jsx # Built-in browser screen capture
│   │   │   ├── bugs/
│   │   │   │   ├── BugCard.jsx          # Kanban cards with severity glow
│   │   │   │   ├── BugModal.jsx         # Defect detail, Expected vs Actual, comments
│   │   │   │   ├── BugCreateModal.jsx   # Form with AI polish & screen recorder
│   │   │   │   ├── DevResolutionPanel.jsx # Claim bug & link Git PR
│   │   │   │   └── AIPolishModal.jsx    # Formats raw notes into clean markdown
│   │   │   ├── tests/
│   │   │   │   ├── TestCaseCard.jsx
│   │   │   │   ├── TestCaseModal.jsx    # Preconditions, steps, linked bugs
│   │   │   │   ├── TestRunDrawer.jsx    # Pass / Fail / Blocked / Skipped drawer
│   │   │   │   └── AutoBugModal.jsx     # Auto-logs bug on step failure
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.jsx      # Health score gauge & bug breakdown
│   │   │   │   ├── CreateProjectModal.jsx
│   │   │   │   └── CompassInfoModal.jsx # MongoDB Compass connection inspector
│   │   │   └── collaboration/
│   │   │       ├── ActivityStream.jsx   # Real-time event ticker
│   │   │       └── WebhookSimulatorModal.jsx # Simulated Git PR merge webhook
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Hero, dual CTA, live role switcher demo
│   │   │   ├── AuthPage.jsx             # Split login: Tester vs Developer portal
│   │   │   ├── DashboardPage.jsx        # Role-calibrated project matrix
│   │   │   └── ProjectDetailPage.jsx    # Bug Hub (Kanban/List), Suites, Runs
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User state & 1-click persona switching
│   │   │   ├── SocketContext.jsx        # Real-time WebSockets
│   │   │   └── ToastContext.jsx         # Notifications & celebratory confetti
│   │   ├── services/
│   │   │   └── api.js                   # REST Client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                    # Dark obsidian aesthetic & scrollbars
│   ├── vite.config.js                   # Proxy configuration to backend:5000
│   ├── tailwind.config.js
│   └── package.json
│
├── start-all.bat                         # 1-Click launcher for both servers
├── start-backend.bat                     # Launch backend API
├── start-frontend.bat                    # Launch frontend UI
└── tester_s_home_product_specification.md
```

---

## ⚡ 3. Pre-Seeded Demo Accounts (1-Click Login)

The system is pre-seeded with realistic QA and developer accounts:

| Role | Persona | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **QA Tester** | Alex Rivera (QA Lead) | `alex.tester@testers-home.io` | `password123` | Create Projects, Edit Suites, Run Tests, Log Bugs, Verify & Close |
| **Developer** | Samira Chen (Dev) | `dev.sam@testers-home.io` | `password123` | Claim Bugs, Link PRs, Mark Fixed, Comments (View-only tests) |
| **QA Admin** | Sarah Connor (VP QA) | `lead.sarah@testers-home.io` | `password123` | Full administrative capabilities across all features |

> **Tip:** You can switch between **QA** and **DEV** personas in 1 second using the toggle badge located on the top navigation bar!

---

## 🚀 4. How to Run the Application

### Option A: Using the 1-Click Launchers (Windows)
Double-click `start-all.bat` (or run `start-backend.bat` and `start-frontend.bat` in separate command prompts).

### Option B: Using the Terminal

#### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
*Backend runs on: `http://localhost:5000`*  
*(It connects to `mongodb://127.0.0.1:27017/testers_home` and auto-seeds on first run)*

#### Step 2: Start the Frontend UI
```bash
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

#### Step 3: Re-seed the Database Anytime (Optional)
```bash
cd backend
npm run seed
```

---

## 🌟 5. Product Features Walkthrough

### 1. **Interactive Role Switcher Demo (Landing Page)**
- Visit `http://localhost:5173`
- Click the live toggle between **Tester (QA)** and **Developer (Dev)** to watch the entire dashboard theme and permissions morph in real time.

### 2. **Bug Hub & Complete Defect Lifecycle**
- Kanban Columns: `Open` ➔ `In Progress` ➔ `Ready for QA` ➔ `Verified & Closed` / `Reopened`.
- **Expected vs. Actual:** Dedicated side-by-side comparison cards for clean analysis.
- **Developer Resolution:** Developers can click "Claim this Bug", input a Git PR URL (e.g. `https://github.com/testers-home/pull/104`), and transition the ticket to `Ready for QA`.
- **QA Verification:** Testers can test the fix and click `Verify Fix & Close` — triggering celebratory screen confetti!

### 3. **AI Bug Report Polish**
- In the Bug Creation form, click **"AI Polish Steps"**.
- Paste raw, messy notes or unformatted console logs; the AI engine extracts error traces and generates formatted numbered markdown steps automatically.

### 4. **Built-in Screen Capture (No Software Needed)**
- In the Bug Creation form, click **"Record Screen"**.
- Uses native browser WebRTC to record tabs or windows directly with live timers, preview player, and instant attachment to the defect draft.

### 5. **Command Palette (`Ctrl + K` / `Cmd + K`)**
- Press `Ctrl + K` anytime to open the cyber search drawer.
- Instantly jump to any bug ticket (`THW-BUG-101`) or test case (`THW-TC-201`), switch roles, or open MongoDB Compass stats.

### 6. **Fast Test Run Execution & Auto-Bug Logging**
- In the **Test Runs** tab, open any active cycle.
- The execution drawer provides fast keyboard/click marking: **Pass**, **Fail**, **Blocked**, **Skipped**.
- Marking **"Fail"** immediately prompts an **Auto-Bug Dialog**, pre-populating the defect ticket with the failed step, test case key, and preconditions!

### 7. **Git PR Webhook Simulator**
- Click **"Simulate PR Webhook"** in the top bar.
- Simulates GitHub PR merge events referencing tickets (e.g. `Fixes THW-BUG-101`), instantly moving the ticket to `Ready for QA` and broadcasting live event alerts.

