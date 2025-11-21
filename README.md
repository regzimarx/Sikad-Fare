# 🚲 Sikad Fare Calculator

<p align="center">

<!-- Status / Metadata Badges -->

<a href="#"><img src="https://img.shields.io/badge/status-active-success" alt="Status"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a> <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="Pull Requests Welcome"></a>

<!-- Tech Badges -->

<br/>
<a><img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white"></a>
<a><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB"></a>
<a><img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
<a><img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white"></a>
<a><img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black"></a>
<a><img src="https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white"></a>

</p>

---

# 📌 Overview

A modern web application designed to help commuters and drivers calculate accurate **sikad** (pedicab/tricycle) fare prices. This tool ensures fairness, transparency, and convenience by providing fare estimations based on routes, baggage, passenger count, and more. Includes **PWA support** for offline use and mobile installation.

### 📍 Community Impact & Background

This project is based on the official **Local Government Unit (LGU) ordinances of Midsayap** regarding Sikad fare pricing.
As students, we took the initiative to create this tool in hopes of helping the **community of Midsayap**, especially with the **rampant issues and inconsistencies** in Sikad fare computation.

Our goal is to promote **fairness**, **awareness**, and **accessibility** by making fare information easier for both drivers and commuters.

---

## 📌 Features

* **Route-Based Fare Calculation**
  Compute fares using predefined local routes.

* **Map-Based Fare Calculation (Planned)**
  Select points on a map using Leaflet to auto-calculate the estimated fare.

* **Baggage & Passenger Options**
  Additional fees and fare adjustments for extra baggage or multiple riders.

* **Gas Price Consideration**
  Factor in current fuel prices to ensure updated fare logic.

* **User Suggestions**
  Submit suggestions for new routes or fare changes directly in the app (stored in Firebase).

* **PWA Support**
  Install the app on your device for offline or mobile-friendly use.

---

## 🛠️ Technologies Used

### **Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* Flowbite
* Leaflet + React Leaflet

### **Backend & Database**

* Firebase (Firestore, Analytics)

### **PWA**

* @ducanh2912/next-pwa

---

## 📁 Project Structure

```
.
├── public/              # Static assets (images, icons, etc.)
├── src/
│   ├── app/             # Application pages & layout (Next.js App Router)
│   ├── components/      
│   │   ├── calculator/  # Fare calculator components
│   │   ├── form/        # Input forms, selectors, etc.
│   │   └── suggestions/ # Suggestion form & list components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Firebase config, fare logic, utilities
│   ├── pages/           # Legacy Next.js Pages (if used)
│   └── services/        # Firebase & external API interactions
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Dependencies & scripts
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd clean-sikad-fare
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Add environment variables

Create `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

---

## 📜 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Run production build     |
| `npm run lint`  | Lint the codebase        |

---

## 📖 Usage

```bash
npm run dev
```

Then open:
➡️ **[http://localhost:3000](http://localhost:3000)**

---

## 🤝 Contributing

1. Fork
2. Create a branch
3. Commit changes
4. Push
5. Open PR

---

## 📄 License

MIT License — see `LICENSE` file.

---

## 📬 Contact

**Your Name**
📧 [vargasjanmatthew867@gmail.com](mailto:vargasjanmatthew867@gmail.com)

Repository:
🔗 [https://github.com/matty-kun/Sikad-Fare](https://github.com/matty-kun/Sikad-Fare)

---
