# Migration from Gemini API to Flask Backend

## Overview
The VACHA SHIELD application has been migrated from using Google's Gemini API to a custom Python Flask backend with advanced audio analysis capabilities.

## What Changed

### Removed
- `@google/genai` dependency
- `geminiService.ts` - Gemini API client
- Old `server.ts` - Express.js wrapper
- `GEMINI_API_KEY` environment variable requirement
- Dependencies: `@google/genai`, `express`, `tsx`, `@types/express`

### Added
- `server.py` - Flask backend with deepfake detection
- `backendService.ts` - New API client for Flask backend
- `requirements.txt` - Python dependencies
- `run.sh` - Convenient script to start both servers
- New endpoints for audio analysis and live monitoring

## Backend Architecture

### Core Detection System
The Flask backend uses sophisticated audio analysis techniques:

1. **Zero Crossing Rate (ZCR)** - Measures frequency transitions
   - Synthetic voices have distinctively different ZCR patterns

2. **Spectral Analysis** - MFCC & Mel-spectrograms
   - Extracts voice formants and spectral characteristics
   - Detects unnatural frequency distributions

3. **Harmonic-Percussive Separation (HPSS)**
   - Analyzes pitch stability and naturalness
   - Identifies pitch contours inconsistent with human speech

4. **Temporal Discontinuities**
   - Detects artifacts and unnatural energy transitions
   - Identifies frame-level anomalies

5. **Noise Floor Analysis**
   - Compares signal-to-noise ratio
   - Synthetic voices often have artificially low noise floors

6. **Cepstral Analysis**
   - Analyzes voice formants and spectral envelopes
   - Detects formant frequency anomalies

### Confidence Scoring
- Scores are calculated from 0-100%
- Multiple features are weighted and averaged
- Higher scores indicate higher probability of synthetic voice
- Threshold of 50% determines deepfake vs human verdict

### Verdict Categories
- **ai_clone** (>65% confidence) - Likely AI-generated
- **borderline_human** (40-65% confidence) - Unclear classification
- **human** (<40% confidence) - Likely authentic human voice

## API Endpoints

### POST /api/analyze-base64
Analyze base64-encoded audio data (for live recording and file uploads)

**Request:**
```json
{
  "audioData": "base64_encoded_audio",
  "mimeType": "audio/webm"
}
```

**Response:**
```json
{
  "isDeepfake": boolean,
  "confidence": number,
  "reasoning": string,
  "verdict": "ai_clone" | "borderline_human" | "human",
  "timestamp": string
}
```

### POST /api/live-analyze
Real-time analysis of streaming audio chunks

**Request:**
```json
{
  "audioChunk": "base64_encoded_chunk"
}
```

**Response:**
```json
{
  "confidence": number,
  "timestamp": string
}
```

### GET /api/health
Health check endpoint

## Dependencies

### Node.js
Removed unnecessary backends:
- Removed: `@google/genai`, `express`, `tsx`
- Kept: React, Vite, UI libraries

### Python
New requirements:
- `Flask` - Web server framework
- `librosa` - Audio processing and feature extraction
- `numpy` - Numerical computing
- `scipy` - Scientific algorithms (signal processing)
- `soundfile` - Audio I/O
- `Flask-CORS` - Cross-origin support

## Environment Variables

### Updated
- `VITE_API_URL` - Backend server URL (default: http://localhost:5000)

### Removed
- `GEMINI_API_KEY` - No longer needed

## Running the Application

### Option 1: Using the convenience script
```bash
./run.sh
```

### Option 2: Manual startup
Terminal 1 - Start Flask backend:
```bash
pip install -r requirements.txt
python server.py
```

Terminal 2 - Start React frontend:
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
python server.py
```

## Performance Improvements

1. **Reduced Dependencies** - Removed Gemini SDK (faster install/build)
2. **Offline Capability** - Backend runs locally, no cloud API calls
3. **Faster Analysis** - Direct audio processing vs network latency
4. **Lower Cost** - No API billing (except cloud deployment costs)
5. **Better Privacy** - Audio data stays on your servers

## File Structure Changes

```
Before:
├── server.ts              (Express wrapper)
├── geminiService.ts       (Gemini client)
└── [no backend logic]

After:
├── server.py              (Flask backend)
├── backendService.ts      (API client)
├── requirements.txt       (Python deps)
└── run.sh                 (Startup script)
```

## Testing the Migration

1. Start both servers
2. Upload an audio file with "Upload Evidence" button
3. Start live monitoring with "INITIATE LINK" button
4. Check analysis results and confidence scores

The detection system should work seamlessly as before, but now with a custom backend.

## Future Enhancements

Possible improvements to the backend:
- Machine learning model integration (PyTorch/TensorFlow)
- Deep learning classification models
- Audio fingerprinting
- Voice biometric analysis
- Real-time processing optimization
- Cloud deployment options (AWS, GCP, Azure)
- Multi-model ensemble voting
