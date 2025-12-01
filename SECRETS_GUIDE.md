# 🔐 Health Assistant AI - Required Secrets & Configuration

## 📋 What You Need to Configure

### 🚨 CRITICAL - Required to Run the App

#### 1. **Google Gemini AI API Key** (REQUIRED)
- **What**: API key for Google's Gemini AI model
- **Where to get it**: https://makersuite.google.com/app/apikey
- **Steps**:
  1. Go to https://makersuite.google.com/app/apikey
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the key (starts with `AIza...`)
- **Where to add**: In your `.env` file as:
  ```
  GOOGLE_GENAI_API_KEY=AIzaSy...your_actual_key_here
  ```
- **Used for**: AI Chatbot, Symptom Checker, Medicine Search

#### 2. **Google Cloud Project ID**
- **What**: Your Firebase/Google Cloud project identifier
- **Current value**: `studio-2526433000-2e931` (already configured)
- **Where to add**: In your `.env` file as:
  ```
  GCLOUD_PROJECT=studio-2526433000-2e931
  ```
- **Note**: This is already set in your Firebase config, just add to `.env`

---

## ✅ Already Configured (No Action Needed)

### Firebase Configuration
All Firebase settings are already in `src/firebase/config.ts`:
- **Project ID**: `studio-2526433000-2e931`
- **App ID**: `1:548223774566:web:16693942e42061dd6a22a7`
- **API Key**: `AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw`
- **Auth Domain**: `studio-2526433000-2e931.firebaseapp.com`
- **Messaging Sender ID**: `548223774566`

**No additional Firebase environment variables needed!**

---

## 📝 Your `.env` File Should Look Like This

Create/edit: `c:\Users\rajan\.gemini\antigravity\scratch\Health-Assistant-AI\.env`

```env
# Google AI (REQUIRED)
GOOGLE_GENAI_API_KEY=AIzaSy...your_actual_gemini_key_here
GCLOUD_PROJECT=studio-2526433000-2e931
```

**That's it!** Just these 2 lines are needed to get started.

---

## 🔮 Optional - For Future Features

Add these later if you implement these features:

### Email Notifications (SendGrid)
```env
SENDGRID_API_KEY=SG.your_sendgrid_key
EMAIL_FROM=noreply@healthmind.ai
```

### SMS Notifications (Twilio)
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Analytics (Google Analytics)
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Error Tracking (Sentry)
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 Quick Setup Checklist

- [ ] Get Google Gemini API key from https://makersuite.google.com/app/apikey
- [ ] Add `GOOGLE_GENAI_API_KEY` to `.env` file
- [ ] Add `GCLOUD_PROJECT=studio-2526433000-2e931` to `.env` file
- [ ] Run `npm install` (I'll do this for you)
- [ ] Run `npm run dev` to start the app
- [ ] Test login/signup
- [ ] Test AI chat to verify API key works

---

## 🔒 Security Notes

1. **Never commit `.env` file to git** - It's already in `.gitignore`
2. **Keep API keys secret** - Don't share them publicly
3. **Use different keys for dev/production** - Create separate projects
4. **Rotate keys regularly** - Change them every few months
5. **Monitor usage** - Check Google AI Studio for API usage

---

## 🆘 Troubleshooting

### "AI not responding"
- Check if `GOOGLE_GENAI_API_KEY` is set correctly in `.env`
- Verify the key is valid at https://makersuite.google.com/app/apikey
- Restart the dev server after adding the key

### "Firebase auth not working"
- Firebase config is already in the code
- No additional env vars needed
- Check Firebase console: https://console.firebase.google.com/

### "Build errors"
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (should be 18+)
- Clear `.next` folder and rebuild

---

## 📞 Where to Get Help

- **Google AI Studio**: https://makersuite.google.com/
- **Firebase Console**: https://console.firebase.google.com/
- **Project Docs**: See `README.md` in project root
- **GenKit Docs**: https://firebase.google.com/docs/genkit

---

*Last updated: November 30, 2025*
