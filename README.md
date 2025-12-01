# Health Assistant AI 🏥🤖

A "Military-Grade" Secure, AI-Powered Personal Health Assistant built with **Next.js 15**, **Firebase**, and **Google Gemini**.

![Health Assistant AI Banner](https://placehold.co/1200x400/0A1D42/FFF?text=Health+Assistant+AI)

## 🚀 Features

### 🔐 Security First ("Military-Grade")
*   **Google-Only Authentication**: No weak passwords. Exclusive Google Sign-In via Firebase Auth.
*   **Strict Data Isolation**: Firestore Security Rules ensure users can *only* read/write their own data.
*   **Content Security Policy (CSP)**: Strict HTTP headers (HSTS, X-Frame-Options) to prevent XSS and clickjacking.
*   **Server-Side Validation**: All critical operations (API routes) are verified with the Firebase Admin SDK.

### 🤖 AI Capabilities (Gemini Pro)
*   **Context-Aware Chatbot**: Remembers your conversation history for personalized health advice.
*   **Symptom Checker**: A dedicated mode to analyze symptoms and suggest potential causes/actions.
*   **Medical Report Analysis**: Upload PDF lab reports or images. The AI extracts key findings, summarizes results, and provides recommendations.
*   **Text-to-Speech (TTS)**: Listen to the AI's advice with natural-sounding voices.

### 📅 Health Management
*   **Medication Schedule**: Track your daily meds with frequency, time, and custom reminder sounds.
*   **Health Dashboard**: A central hub for your vitals, upcoming doses, and recent activity.
*   **Profile Management**: Store essential health info (blood type, allergies, emergency contacts) securely.

### 📊 Reports & Analytics
*   **PDF Generation**: Download professional, AI-generated summaries of your medical reports.
*   **Visual Analysis**: Color-coded interpretation of lab results (Normal, Abnormal, Critical).

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
*   **Backend / DB**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, Analytics)
*   **AI Model**: [Google Gemini Pro](https://ai.google.dev/) (via Genkit)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Forms**: React Hook Form + Zod

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/health-assistant-ai.git
cd health-assistant-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your keys:

```env
# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (Private - Server Only)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the **Environment Variables** from step 3 to Vercel's settings.
4.  Deploy!

> **Note:** Don't forget to add your Vercel domain (e.g., `yourapp.vercel.app`) to the **Authorized Domains** list in the Firebase Console (Authentication -> Settings).

---

## 📱 Mobile App (Coming Soon)
We are planning a native mobile version using **React Native**, which will share the same Firebase backend and business logic.

---

## 📄 License
This project is licensed under the MIT License.
