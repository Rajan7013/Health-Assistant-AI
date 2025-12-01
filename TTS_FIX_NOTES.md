# 🔧 Text-to-Speech Fix Applied

## Problem Identified

The text-to-speech feature was failing because:

1. **Buffer vs Uint8Array**: The code was using Node.js `Buffer` type which doesn't exist in the browser
2. **Browser Compatibility**: Browsers need `Uint8Array` or `ArrayBuffer` for audio data
3. **Timeout Too Short**: 5 second timeout was too short for longer responses

## Fixes Applied

### 1. Fixed Buffer Compatibility ✅

**File**: `src/app/(app)/chat/page.tsx`

**Changes**:
- Changed `Buffer[]` to `Uint8Array[]`
- Added conversion: `new Uint8Array(chunk)` for browser compatibility
- Added check for empty audio data

**Before**:
```typescript
const audioChunks: Buffer[] = [];
for await (const chunk of stream) {
  audioChunks.push(chunk);
}
```

**After**:
```typescript
const audioChunks: Uint8Array[] = [];
for await (const chunk of stream) {
  const uint8Array = chunk instanceof Uint8Array 
    ? chunk 
    : new Uint8Array(chunk);
  audioChunks.push(uint8Array);
}

if (audioChunks.length === 0) {
  throw new Error('No audio data received');
}
```

### 2. Increased Timeout ✅

**Before**: 5000ms (5 seconds)
**After**: 10000ms (10 seconds)

This gives more time for longer AI responses to generate audio.

### 3. Better Error Messages ✅

Added check for empty audio data with clear error message.

---

## How to Test

1. **Restart the dev server** (if running):
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Go to AI Chat**: http://localhost:9002/chat

3. **Ask a question**: "What is paracetamol?"

4. **Click the play button** (speaker icon) on the AI response

5. **Expected behavior**:
   - Loading spinner appears
   - Audio plays after a few seconds
   - Play button changes to pause button
   - Audio plays smoothly

---

## Common Issues & Solutions

### Issue: "Audio playback failed"

**Possible causes**:
1. API key not configured
2. Network issue
3. Audio format not supported

**Solutions**:
- Check `.env` has `GOOGLE_GENAI_API_KEY`
- Check browser console for detailed errors
- Try Chrome/Edge (best compatibility)

### Issue: "MediaSource timeout"

**Cause**: Audio generation taking too long

**Solutions**:
- Timeout increased to 10 seconds
- If still timing out, ask shorter questions
- Check internet connection

### Issue: "No audio data received"

**Cause**: TTS API returned empty response

**Solutions**:
- Check API key has TTS access
- Verify Gemini 2.5 Flash TTS model is available
- Check API quota/limits

### Issue: Audio plays but sounds garbled

**Cause**: Incorrect audio format or codec

**Solutions**:
- This should be fixed with Uint8Array conversion
- Try different browser
- Check browser console for codec errors

---

## Browser Compatibility

### ✅ Fully Supported
- Chrome 90+
- Edge 90+
- Safari 14+

### ⚠️ Limited Support
- Firefox (may have MediaSource issues)
- Older browsers

### ❌ Not Supported
- Internet Explorer
- Very old mobile browsers

---

## Technical Details

### Audio Pipeline

1. **Text Input** → AI response text
2. **TTS Generation** → `textToSpeechStream()` called
3. **Streaming** → Audio chunks streamed from Gemini API
4. **Buffer Conversion** → Node.js Buffer → Uint8Array
5. **MediaSource** → Chunks appended to SourceBuffer
6. **Playback** → HTML5 Audio element plays

### Audio Format

- **Codec**: MP3 (audio/mpeg)
- **Source**: Gemini 2.5 Flash TTS model
- **Voice**: Puck (default)
- **Streaming**: Yes (real-time playback)

---

## Next Steps

If audio still doesn't work:

1. **Check browser console** for errors
2. **Verify API key** is correct
3. **Test with simple question** first
4. **Try different browser**
5. **Check network tab** in DevTools

---

## Alternative: Disable TTS (If Needed)

If TTS continues to have issues, you can temporarily hide the play button:

**File**: `src/app/(app)/chat/page.tsx`

Find line ~400 and comment out the Button:

```typescript
{/* Temporarily disabled TTS
{message.role === 'assistant' && (
  <Button ... />
)}
*/}
```

---

*Fix applied: November 30, 2025, 9:50 PM IST*
