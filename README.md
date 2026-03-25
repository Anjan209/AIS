# VACHA SHIELD - Voice Deepfake Detection System

A real-time voice deepfake detection application that monitors audio calls and analyzes audio files for synthetic voice patterns. Uses advanced spectral analysis and ML-based detection to identify AI-generated voice content.

## Features

- Real-time voice monitoring for live calls
- Audio file upload and analysis
- Spectral analysis and anomaly detection
- Live feedback with threat level indicators
- Analysis history tracking
- WhatsApp call monitoring support
- Dark/Light theme support

## Architecture

The application consists of two main components:

### Frontend (React + TypeScript + Vite)
- Real-time audio visualization (spectrograms, waveforms)
- Interactive UI with threat detection feedback
- Call monitoring interface
- Analysis history

### Backend (Python + Flask)
- Audio processing and deepfake detection
- Spectral feature extraction (MFCC, Mel-spectrograms)
- Anomaly detection algorithms
- REST API endpoints

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- pip (Python package manager)

### Frontend Setup

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. The frontend is configured to connect to the backend at `http://localhost:5000`

3. Build the frontend:
   ```bash
   npm run build
   ```

### Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the Flask server:
   ```bash
   python server.py
   ```

The backend will start on `http://localhost:5000`

## Running the Application

### Development Mode

1. Start the Python backend:
   ```bash
   python server.py
   ```

2. In another terminal, start the frontend dev server:
   ```bash
   npm run dev
   ```

3. Access the app at `http://localhost:3000`

### Production Build

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the Flask backend:
   ```bash
   python server.py
   ```

3. Serve the built frontend from the `dist/` directory

## API Endpoints

### Health Check
- `GET /api/health` - Check backend status

### Audio Analysis
- `POST /api/analyze-base64` - Analyze base64 encoded audio
  - Body: `{ audioData: string, mimeType: string }`
  - Returns: `{ isDeepfake: boolean, confidence: number, reasoning: string, verdict: string }`

- `POST /api/analyze-audio` - Analyze uploaded audio file
  - Body: multipart/form-data with `file` field
  - Supported formats: WAV, MP3, WebM, OGG, M4A

### Live Analysis
- `POST /api/live-analyze` - Analyze streaming audio chunks
  - Body: `{ audioChunk: string (base64) }`
  - Returns: `{ confidence: number }`

## How It Works

The detection system analyzes multiple audio characteristics:

1. **Zero Crossing Rate** - Detects unnatural frequency patterns
2. **Spectral Features** - Analyzes frequency distribution and shifts
3. **Temporal Discontinuities** - Identifies artifacts in synthetic speech
4. **Pitch Stability** - Detects unnatural pitch contours
5. **Cepstral Coefficients** - Analyzes voice formants
6. **Noise Floor Analysis** - Compares signal vs noise ratios

A confidence score (0-100%) is calculated based on these features. Higher scores indicate more likely AI-generated content.

## File Structure

```
project/
├── src/
│   ├── App.tsx              # Main React component
│   ├── backendService.ts    # API service for backend communication
│   ├── types.ts             # TypeScript type definitions
│   ├── utils.ts             # Utility functions
│   └── ...
├── server.py                # Flask backend server
├── requirements.txt         # Python dependencies
├── vite.config.ts          # Vite configuration
├── package.json            # Node.js dependencies
└── README.md
```

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Performance Notes

- Maximum audio file size: 50MB
- Maximum analysis duration: 30 seconds per file
- Recommended microphone sample rate: 16kHz
- Live monitoring updates in real-time chunks

## Security Considerations

- Microphone access requires user permission
- Audio data is processed locally or sent only to backend
- No audio files are permanently stored
- CORS enabled for development

## Troubleshooting

### Backend Connection Error
- Ensure Flask server is running on port 5000
- Check `VITE_API_URL` in `.env`

### Audio File Format Error
- Supported formats: WAV, MP3, WebM, OGG, M4A
- Maximum file size: 50MB

### Microphone Access Denied
- Browser needs microphone permission
- Check browser privacy settings

## License

All rights reserved - VACHA SHIELD
