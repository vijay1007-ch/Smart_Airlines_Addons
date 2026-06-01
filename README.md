# ✈️ Smart Airline Platform

A premium, full-stack web application designed for a modern airline experience. This platform offers a seamless interface for passengers to purchase flight add-ons, upgrade seats, and manage their trips, alongside a powerful dashboard for administrators to monitor operations in real time.

## ✨ Key Features

### 👨‍✈️ Dual-Role Architecture (Admin & User)
- **User Portal:** Passengers can browse a rich catalogue of add-ons, book seat upgrades, and view their purchase history.
- **Admin Dashboard:** Administrators have full access to real-time analytics, order approval workflows, and catalogue management (CRUD operations).

### 💎 State-of-the-Art UI/UX
- **Glassmorphism Design:** Built using stunning frosted-glass aesthetics with dynamic backdrop blurring and neon accents.
- **Global Theme Toggle:** A flawless transition between a deep-space Dark Mode and a sleek frosted Light Mode.
- **Smart Sidebar:** A centralized, auto-hiding navigation drawer that replaces cluttered traditional navbars.

### 🎫 Dynamic Boarding Pass Generator
Upon successful checkout, the system generates a highly realistic, downloadable PDF Boarding Pass complete with a dynamically generated, scannable QR Code.

### 💎 Loyalty & Memberships
- **SkyPoints System:** A gamified loyalty program that calculates earned points based on purchase history and dynamically updates a visual tier progression bar (Silver, Gold, Platinum).
- **The "Shuu Pass":** A premium, 1-year valid subscription model. Once purchased, the intelligent cart system auto-detects the membership and instantly slashes 22% (Domestic) or 44% (International) off every future purchase.

### 🏷️ Advanced Discount Logic
- Built-in coupon system that validates usage limits per user (e.g., custom 99.99% VIP discount codes limited to exactly 10 uses).

### 🔒 Cross-Network Connectivity & 2-Step Authentication (2FA)
- **Settings Gear Widget:** A glassmorphic configurator accessible on the top right of all pages to dynamically configure the API server URL.
- **Live Connection Ping Indicator:** Automatically pings the configured backend host to display `Connected 🟢` or `Offline 🔴` in real-time, validating cross-device/mobile network connections.
- **Dynamic Link Origin Mappings:** Resolves password reset links dynamically based on the client's hostname origin (`clientOrigin`), ensuring mobile/remote users can click reset links and access the app from any network.
- **Email & Mobile 2FA Verification:** Secures logins and password resets with an OTP challenge, sending real codes via Nodemailer (Gmail SMTP) and outputting simulated Mobile OTP codes.
- **Browser SMS Notification Simulator:** Slides up a premium virtual phone toast popup overlay with an **Auto-Fill SMS** feature for effortless developer testing.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Data Persistence:** Local JSON storage & Browser LocalStorage (for session mapping)
- **Key Libraries:** `react-qr-code` (QR Generation), `html2canvas` & `jspdf` (PDF generation), `lucide-react` (Iconography)

## 🚀 Running Locally

Follow these steps to run the platform on your local machine.

**1. Clone the repository:**
```bash
git clone https://github.com/vijay1007-ch/smart-airline-platform.git
cd smart-airline-platform
```

**2. Install Dependencies:**
This project uses `concurrently` to run both the frontend and backend simultaneously.
```bash
npm install
```

**3. Start the Servers:**
```bash
npm start
```
The React frontend will launch on `http://localhost:5173` and the Express API will run on `http://localhost:5000`.

## 🔒 Default Credentials
For testing purposes, you can log in using the following test accounts:
- **Admin:** `admin2@gmail.com` / `admin123`
- **User:** Register a new account or log in with an existing user.
