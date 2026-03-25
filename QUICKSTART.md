# VACHA SHIELD Quick Start Guide

## Installation (5 minutes)

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- 100MB+ free disk space

### Step 1: Install Python Backend Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

## Running the Application

### Option A: Automatic (Easiest)
```bash
./run.sh
```

### Option B: Manual (Two Terminals)

**Terminal 1 - Start Backend:**
```bash
python server.py
```
You should see: `Running on http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
You should see: `Local: http://localhost:5173`

## First Time Usage

1. **Open the app** → http://localhost:5173 (or 5000 for Vite default)
2. **Grant microphone access** when browser prompts
3. **Try these features:**
   - **Upload Audio** - Click "Upload Evidence" to analyze an audio file
   - **Live Monitoring** - Click "INITIATE LINK" to analyze your voice in real-time
   - **Call Monitor** - Switch to "Call Monitor" tab for WhatsApp call analysis
   - **View History** - Switch to "History" tab to see past analyses

## Features Overview

### Scanner Tab
- **Real-time voice analysis** via microphone
- **Audio file upload** in WAV, MP3, WebM, OGG formats
- **Live confidence meter** showing threat level
- **Quick scan** to analyze recorded segments
- **Visual feedback** with spectrograms and waveforms

### Call Monitor Tab
- **Monitor WhatsApp calls** in real-time
- **Live threat detection** with visual indicators
- **Instant alerts** when synthetic voice detected
- **Clear verdicts** - Human Voice vs Synthetic

### History Tab
- **Analysis log** of all previous scans
- **Confidence scores** for each analysis
- **Verdicts** - AI Clone, Borderline, or Human
- **Timestamps** for tracking

## Understanding Results

### Confidence Scores
- **0-40%** → Human Voice (Authentic)
- **40-65%** → Borderline (Inconclusive)
- **65-100%** → AI Clone (Synthetic)

### Detection Method
The system analyzes:
- Spectral characteristics (frequency patterns)
- Harmonic content (pitch stability)
- Energy discontinuities (artifacts)
- Voice formants (unique characteristics)
- Noise patterns (synthetic vs natural)

## System Status Indicators

**Top Right Corner:**
- **Live Link Active** - Microphone connected and recording
- **Standby Mode** - Ready but not recording
- **NET: SECURE** - Connection status
- **API: ONLINE** - Backend server running

## Common Issues & Solutions

### "Backend Connection Error"
- Check Flask is running: `python server.py`
- Verify port 5000 is available
- Check browser console for details

### "Microphone Access Denied"
- Allow microphone in browser privacy settings
- Try a different browser
- Check system microphone is working

### "Invalid file format"
- Supported: WAV, MP3, WebM, OGG, M4A
- Maximum file size: 50MB
- Maximum duration: 30 seconds

### "Analysis failed"
- Check audio file is valid
- Try a different audio format
- Ensure backend is running

## Advanced Settings

Click the **gear icon** (⚙️) to access:
- **AI Model Core** - Select detection model
- **Detection Sensitivity** - High/Medium/Low
- **Alert Threshold** - Adjust sensitivity (10-90%)

## Tips for Best Results

1. **Use high-quality audio** - Clear, noise-free recordings work best
2. **Test with known samples** - Use known AI/human voice samples first
3. **Monitor in quiet environments** - Background noise affects accuracy
4. **Enable speakerphone for calls** - Essential for WhatsApp monitoring
5. **Use natural language** - Synthetic voices show patterns during speech

## File Management

### Temporary Files
- Audio uploads are analyzed and NOT stored
- Export recordings if you need to keep them
- Download button available after analysis

### Data Privacy
- All audio stays on your local server
- No external API calls (unlike Gemini version)
- Backend never logs audio content
- Only confidence scores are tracked

## Architecture Overview

```
Your Device
    ↓
    ├─ Frontend (React)
    │  └─ http://localhost:5173
    ↓
    ├─ Backend (Flask)
    │  ├─ Audio Processing
    │  ├─ Feature Extraction
    │  └─ Deepfake Detection
    │  └─ http://localhost:5000
    ↓
Results displayed with confidence score
```

## Production Deployment

For production use:
1. Build frontend: `npm run build`
2. Copy `dist/` folder to web server
3. Run Flask on production server
4. Update `VITE_API_URL` to production backend URL
5. Use HTTPS/SSL for security
6. Set proper CORS headers
7. Implement rate limiting

## Support & Next Steps

- Check `README.md` for detailed documentation
- Review `MIGRATION.md` for technical changes
- Check `server.py` for backend implementation
- Inspect `src/backendService.ts` for API integration

## Quick Reference Commands

```bash
# Development
./run.sh                          # Start both servers
npm run dev                       # Frontend only
python server.py                  # Backend only

# Building
npm run build                     # Create production build
npm run clean                     # Remove build artifacts

# Maintenance
npm install                       # Update frontend deps
pip install -r requirements.txt   # Update backend deps

# Debugging
npm run lint                      # Check TypeScript
curl http://localhost:5000/api/health  # Check backend
```

Enjoy using VACHA SHIELD!
