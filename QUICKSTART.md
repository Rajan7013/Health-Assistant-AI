# 🚀 Quick Start Guide - Health Assistant AI

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages (~60 packages).

---

## Step 2: Configure Environment Variables

1. **Get your Google Gemini API Key**:
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key

2. **Add to your `.env` file**:
   
   Open: `c:\Users\rajan\.gemini\antigravity\scratch\Health-Assistant-AI\.env`
   
   Make sure it contains:
   ```env
   GOOGLE_GENAI_API_KEY=your_actual_api_key_here
   GCLOUD_PROJECT=studio-2526433000-2e931
   ```

---

## Step 3: Deploy Firebase Rules (Optional but Recommended)

```bash
# Login to Firebase
firebase login

# Select the project
firebase use studio-2526433000-2e931

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

---

## Step 4: Start Development Server

```bash
npm run dev
```

The app will run on: **http://localhost:9002**

---

## Step 5: Test the Application

1. **Open browser**: http://localhost:9002
2. **Sign up**: Create a new account
3. **Test AI Chat**: Go to AI Chat and ask a health question
4. **Test Symptom Checker**: Describe symptoms
5. **Create Schedule**: Add a medication reminder

---

## Optional: Start GenKit Dev UI

In a separate terminal:

```bash
npm run genkit:watch
```

This opens a UI to test AI flows independently.

---

## 🎯 What to Do Next

After the app is running:

1. ✅ Test all features
2. ✅ Add your profile information
3. ✅ Try the symptom checker
4. ✅ Create a medication schedule
5. ✅ Browse the disease library

---

## 🐛 Common Issues

### "Module not found"
```bash
npm install
```

### "AI not responding"
- Check `.env` file has correct `GOOGLE_GENAI_API_KEY`
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Firebase error"
- Check internet connection
- Verify Firebase project is active
- Deploy Firestore rules

---

## 📚 Available Scripts

```bash
npm run dev          # Start Next.js dev server (port 9002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript errors
npm run genkit:dev   # Start GenKit dev server
npm run genkit:watch # Start GenKit with auto-reload
```

---

## 🔗 Important Links

- **Landing Page**: http://localhost:9002
- **Dashboard**: http://localhost:9002/dashboard
- **AI Chat**: http://localhost:9002/chat
- **Symptom Checker**: http://localhost:9002/symptom-checker

---

*Ready to build! 🎉*
