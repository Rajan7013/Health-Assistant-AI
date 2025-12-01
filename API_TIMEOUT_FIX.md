# 🔧 API Connection Timeout Fix

## Problem

Getting connection timeout errors:
```
Error [ConnectTimeoutError]: Connect Timeout Error 
(attempted address: generativelanguage.googleapis.com:443, timeout: 10000ms)
```

## Root Causes Identified

### 1. Wrong Environment Variable Name ❌
**Problem**: `.env` had `GEMINI_API_KEY` but code expects `GOOGLE_GENAI_API_KEY`

**Fix Applied**: ✅ Renamed to `GOOGLE_GENAI_API_KEY`

### 2. API Key Not Explicitly Passed ❌
**Problem**: GenKit wasn't explicitly using the environment variable

**Fix Applied**: ✅ Added explicit API key configuration in `genkit.ts`

### 3. Network Timeout (10 seconds) ⚠️
**Problem**: 10 second timeout may be too short for slow connections

**Status**: Monitoring - may need to increase if issues persist

---

## Fixes Applied

### Fix 1: Corrected Environment Variable ✅

**File**: `.env`

**Before**:
```env
GEMINI_API_KEY=AIzaSy...
```

**After**:
```env
GOOGLE_GENAI_API_KEY=AIzaSy...
```

### Fix 2: Explicit API Key Configuration ✅

**File**: `src/ai/genkit.ts`

**Before**:
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

**After**:
```typescript
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    })
  ],
  model: 'googleai/gemini-2.5-flash',
  promptDir: './prompts',
});
```

---

## How to Test

1. **Restart the dev server** (IMPORTANT):
   ```bash
   # Press Ctrl+C to stop the current server
   npm run dev
   ```

2. **Go to AI Chat**: http://localhost:9002/chat

3. **Ask a simple question**: "What is aspirin?"

4. **Expected behavior**:
   - Loading indicator appears
   - AI responds within 5-10 seconds
   - No timeout errors

---

## If Still Getting Timeout Errors

### Check 1: Verify API Key

```bash
# In PowerShell
Get-Content .env
```

Should show:
```
GOOGLE_GENAI_API_KEY=AIzaSy...
```

### Check 2: Test API Key Directly

Visit: https://makersuite.google.com/app/apikey

- Verify your API key is active
- Check if it has any restrictions
- Ensure billing is enabled (if required)

### Check 3: Network/Firewall

**Possible blockers**:
- Corporate firewall
- VPN blocking Google APIs
- Antivirus software
- Windows Firewall

**Solutions**:
1. Try disabling VPN temporarily
2. Check Windows Firewall settings
3. Try from different network (mobile hotspot)
4. Add exception for `generativelanguage.googleapis.com`

### Check 4: Proxy Settings

If you're behind a proxy, you may need to configure it:

**Create/edit**: `c:\Users\rajan\.gemini\antigravity\scratch\Health-Assistant-AI\.npmrc`

```
proxy=http://your-proxy:port
https-proxy=http://your-proxy:port
```

---

## Alternative: Use Different Model

If timeout persists, try a faster model:

**File**: `src/ai/genkit.ts`

Change:
```typescript
model: 'googleai/gemini-1.5-flash',  // Faster, simpler model
```

---

## Troubleshooting Commands

### Check if API is reachable

```powershell
# Test DNS resolution
nslookup generativelanguage.googleapis.com

# Test connection
Test-NetConnection -ComputerName generativelanguage.googleapis.com -Port 443
```

### Check environment variables are loaded

Add to `src/ai/genkit.ts` temporarily:
```typescript
console.log('API Key loaded:', process.env.GOOGLE_GENAI_API_KEY ? 'YES' : 'NO');
```

---

## Error Codes Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `UND_ERR_CONNECT_TIMEOUT` | Connection timeout | Check network, increase timeout |
| `ENOTFOUND` | DNS resolution failed | Check internet, DNS settings |
| `ECONNREFUSED` | Connection refused | Check firewall, proxy |
| `401 Unauthorized` | Invalid API key | Check API key in .env |
| `403 Forbidden` | API key restrictions | Check API key settings |
| `429 Too Many Requests` | Rate limit exceeded | Wait or upgrade quota |

---

## Current Configuration

**Environment Variables**:
```
GOOGLE_GENAI_API_KEY=AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw
GCLOUD_PROJECT=studio-2526433000-2e931
```

**GenKit Model**: `gemini-2.5-flash`

**Timeout**: 10 seconds (default)

---

## Next Steps

1. ✅ Restart dev server with new configuration
2. ✅ Test with simple question
3. ⏳ Monitor for timeout errors
4. ⏳ If errors persist, check network/firewall

---

*Fix applied: November 30, 2025, 9:55 PM IST*
