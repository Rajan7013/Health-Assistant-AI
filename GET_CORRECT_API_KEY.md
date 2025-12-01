# 🚨 CRITICAL: Wrong API Key - 403 Forbidden Error

## The Problem

You're getting this error:
```
[403 Forbidden] Requests to this API method google.ai.generativelanguage.v1beta.GenerativeService.GenerateContent are blocked.
```

## Root Cause

**You're using the Firebase API key, NOT the Gemini AI API key!**

Your current `.env` has:
```
GOOGLE_GENAI_API_KEY=AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw
```

This is your **Firebase API key** (from `firebase/config.ts`), which:
- ✅ Works for Firebase Auth, Firestore
- ❌ Does NOT work for Gemini AI API calls

You need a **separate Gemini AI API key**!

---

## ✅ Solution: Get the Correct API Key

### Step 1: Go to Google AI Studio

**Open this link**: https://aistudio.google.com/app/apikey

### Step 2: Sign In

- Use your Google account
- Accept terms if prompted

### Step 3: Create API Key

1. Click **"Create API Key"** or **"Get API key"**
2. Select **"Create API key in new project"** (recommended)
   - OR select an existing Google Cloud project
3. Copy the new API key (starts with `AIza...`)

### Step 4: Update Your `.env` File

**Open**: `c:\Users\rajan\.gemini\antigravity\scratch\Health-Assistant-AI\.env`

**Replace** the `GOOGLE_GENAI_API_KEY` line with your NEW key:

```env
# Google AI (REQUIRED) - Get from https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=AIza...YOUR_NEW_GEMINI_KEY_HERE
GCLOUD_PROJECT=studio-2526433000-2e931

# Firebase (Already configured in code)
FIREBASE_API_KEY=AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw
FIREBASE_AUTH_DOMAIN=studio-2526433000-2e931.firebaseapp.com
FIREBASE_PROJECT_ID=studio-2526433000-2e931
FIREBASE_MESSAGING_SENDER_ID=548223774566
```

**IMPORTANT**: Keep both keys! Firebase key for auth, Gemini key for AI.

### Step 5: Restart Dev Server

```bash
# Press Ctrl+C to stop
npm run dev
```

---

## 🔍 How to Verify You Have the Right Key

### Gemini AI API Key (for AI features):
- **Get from**: https://aistudio.google.com/app/apikey
- **Used for**: AI Chat, Symptom Checker, Medicine Search, Text-to-Speech
- **Looks like**: `AIzaSy...` (different from Firebase key)
- **Free tier**: 60 requests/minute, 1,500 requests/day

### Firebase API Key (for auth/database):
- **Already have**: `AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw`
- **Used for**: Login, Signup, Firestore, Firebase Auth
- **Already configured**: In `src/firebase/config.ts`

---

## 📸 Visual Guide

### What Google AI Studio Looks Like:

1. **Homepage**: https://aistudio.google.com/
2. **Click**: "Get API key" (top right)
3. **Or go directly to**: https://aistudio.google.com/app/apikey
4. **You'll see**:
   - Button: "Create API key"
   - Option: "Create API key in new project"
   - Option: "Create API key in existing project"

### What to Choose:

**Recommended**: "Create API key in new project"
- Easier setup
- Separate from Firebase
- Cleaner organization

**Alternative**: "Create API key in existing project"
- If you want to use existing Google Cloud project
- More control over billing/quotas

---

## ⚠️ Common Mistakes

### Mistake 1: Using Firebase Key for Gemini
❌ **Wrong**: Using `AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw` (Firebase key)
✅ **Right**: Get NEW key from https://aistudio.google.com/app/apikey

### Mistake 2: Not Restarting Server
❌ **Wrong**: Changing `.env` but not restarting
✅ **Right**: Always restart with `Ctrl+C` then `npm run dev`

### Mistake 3: API Key Restrictions
❌ **Wrong**: Setting IP/domain restrictions on API key
✅ **Right**: Leave unrestricted for development (restrict in production)

---

## 🆘 Troubleshooting

### "I don't see Create API Key button"

**Possible reasons**:
1. Not signed in to Google account
2. Google AI Studio not available in your region
3. Need to accept terms of service

**Solutions**:
- Try different Google account
- Use VPN if region-blocked
- Clear browser cache/cookies

### "API key created but still getting 403"

**Check**:
1. Did you copy the FULL key? (starts with `AIza`)
2. Did you paste it in `.env` correctly?
3. Did you restart the dev server?
4. Is there a space or newline in the key?

**Test**:
```bash
# Check what's in .env
Get-Content .env
```

Should show:
```
GOOGLE_GENAI_API_KEY=AIza...YOUR_NEW_KEY
```

### "I created key but it's not working"

**Wait time**: New API keys can take 1-2 minutes to activate

**Try**:
1. Wait 2 minutes
2. Restart dev server
3. Try again

---

## 📊 API Key Comparison

| Feature | Firebase API Key | Gemini AI API Key |
|---------|-----------------|-------------------|
| **Purpose** | Auth, Firestore | AI features |
| **Get from** | Firebase Console | Google AI Studio |
| **Your current key** | `AIzaSyAGAdn...rNTw` | **NEED TO GET** |
| **Variable name** | `FIREBASE_API_KEY` | `GOOGLE_GENAI_API_KEY` |
| **Already working** | ✅ Yes | ❌ No - need new key |

---

## ✅ Final Checklist

Before testing again:

- [ ] Went to https://aistudio.google.com/app/apikey
- [ ] Created NEW API key (not using Firebase key)
- [ ] Copied the FULL key
- [ ] Updated `.env` with `GOOGLE_GENAI_API_KEY=...`
- [ ] Saved `.env` file
- [ ] Restarted dev server (`Ctrl+C` then `npm run dev`)
- [ ] Waited 1-2 minutes for key to activate
- [ ] Tested AI chat

---

## 🎯 Quick Fix Command

After getting your new Gemini API key, run this (replace `YOUR_NEW_KEY`):

```powershell
# Update .env with new key
@"
# Google AI (REQUIRED)
GOOGLE_GENAI_API_KEY=YOUR_NEW_KEY_HERE
GCLOUD_PROJECT=studio-2526433000-2e931

# Firebase (Already configured in code)
FIREBASE_API_KEY=AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw
FIREBASE_AUTH_DOMAIN=studio-2526433000-2e931.firebaseapp.com
FIREBASE_PROJECT_ID=studio-2526433000-2e931
FIREBASE_MESSAGING_SENDER_ID=548223774566
"@ | Set-Content .env
```

Then restart: `npm run dev`

---

## 🔗 Important Links

- **Get Gemini API Key**: https://aistudio.google.com/app/apikey
- **Google AI Studio**: https://aistudio.google.com/
- **API Documentation**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing (Free tier available!)

---

*This is the #1 issue! Get the correct API key and everything will work! 🚀*

*Created: November 30, 2025, 9:55 PM IST*
