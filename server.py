import os
import json
import base64
import numpy as np
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import librosa
import soundfile as sf
from scipy import signal
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'webm', 'ogg', 'm4a'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_mfcc_features(audio_data, sr=16000, n_mfcc=13):
    """Extract MFCC features from audio"""
    mfcc = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std = np.std(mfcc, axis=1)
    return np.concatenate([mfcc_mean, mfcc_std])

def extract_spectral_features(audio_data, sr=16000):
    """Extract spectral features"""
    S = librosa.feature.melspectrogram(y=audio_data, sr=sr)
    spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=sr)[0]

    return {
        'centroid_mean': float(np.mean(spectral_centroid)),
        'centroid_std': float(np.std(spectral_centroid)),
        'rolloff_mean': float(np.mean(spectral_rolloff)),
        'rolloff_std': float(np.std(spectral_rolloff))
    }

def analyze_deepfake_probability(audio_data, sr=16000):
    """
    Analyze audio for deepfake characteristics.
    Looks for patterns common in synthetic voices:
    - Unnatural frequency distribution
    - Artifact patterns
    - Temporal inconsistencies
    - Spectral anomalies
    """

    scores = []

    # 1. Zero Crossing Rate Analysis (synthetic voices have different patterns)
    zcr = librosa.feature.zero_crossing_rate(audio_data)[0]
    zcr_variance = np.var(zcr)
    scores.append(min(100, zcr_variance * 50))

    # 2. Spectral features
    spectral_features = extract_spectral_features(audio_data, sr)
    spectral_score = spectral_features['centroid_std'] * 0.5
    scores.append(min(100, spectral_score))

    # 3. Temporal discontinuities (synthetic voices often have artifacts)
    frame_energy = np.array([np.sum(audio_data[i:i+512]**2) for i in range(0, len(audio_data), 512)])
    if len(frame_energy) > 1:
        energy_diff = np.diff(frame_energy)
        discontinuity = np.sum(np.abs(energy_diff[energy_diff > np.mean(energy_diff)]))
        scores.append(min(100, discontinuity / (len(audio_data) / 512) * 10))

    # 4. Pitch stability (synthetic voices often have unnatural pitch contours)
    # Using harmonic-percussive separation as a proxy
    D = librosa.stft(audio_data)
    H, P = librosa.decompose.hpss(D)
    harmonic_ratio = np.sum(np.abs(H)) / (np.sum(np.abs(H)) + np.sum(np.abs(P)))
    scores.append((1 - harmonic_ratio) * 100)

    # 5. Cepstral coefficients anomalies
    mfcc = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13)
    mfcc_var = np.var(mfcc, axis=1).mean()
    scores.append(min(100, mfcc_var * 100))

    # 6. Noise floor analysis (synthetic voices often have lower noise)
    S = librosa.feature.melspectrogram(y=audio_data, sr=sr)
    noise_floor = np.percentile(S, 20)
    signal_floor = np.percentile(S, 80)
    noise_ratio = (signal_floor - noise_floor) / (signal_floor + 1e-10)
    scores.append(min(100, noise_ratio * 50))

    # Calculate confidence (average of all scores with weighting)
    confidence = np.mean(scores)
    confidence = np.clip(confidence, 0, 100)

    return confidence

def get_analysis_reasoning(confidence, audio_duration):
    """Generate human-readable reasoning for the analysis"""

    if confidence > 75:
        return f"Synthetic voice patterns detected. Spectral analysis reveals characteristics consistent with AI-generated audio. Temporal discontinuities and harmonic anomalies suggest voice synthesis. Duration: {audio_duration:.1f}s. Confidence level indicates high probability of deepfake generation."
    elif confidence > 60:
        return f"Potential AI-generated characteristics detected. Moderate anomalies in spectral composition and harmonic content. Some features suggest possible voice synthesis, though human voice characteristics are also present. Duration: {audio_duration:.1f}s. Recommend additional verification."
    elif confidence > 40:
        return f"Mixed voice characteristics detected. Audio contains both natural and potentially synthetic patterns. Spectral analysis shows some irregularities but not conclusive. Duration: {audio_duration:.1f}s. Result is inconclusive."
    else:
        return f"Natural voice patterns predominantly detected. Audio characteristics consistent with human speech. Minimal anomalies in spectral and temporal analysis. Duration: {audio_duration:.1f}s. High confidence in authentic human voice."

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'vacha-shield-backend'})

@app.route('/api/analyze-audio', methods=['POST'])
def analyze_audio():
    """Analyze uploaded audio file for deepfake detection"""

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Supported: WAV, MP3, WebM, OGG, M4A'}), 400

        # Load audio
        audio_data, sr = librosa.load(BytesIO(file.read()), sr=16000, mono=True)

        # Limit to 30 seconds
        if len(audio_data) / sr > 30:
            audio_data = audio_data[:sr * 30]

        # Analyze
        confidence = analyze_deepfake_probability(audio_data, sr)
        is_deepfake = confidence > 50
        audio_duration = len(audio_data) / sr
        reasoning = get_analysis_reasoning(confidence, audio_duration)

        return jsonify({
            'isDeepfake': is_deepfake,
            'confidence': int(confidence),
            'reasoning': reasoning,
            'verdict': 'ai_clone' if confidence > 65 else ('borderline_human' if confidence > 40 else 'human'),
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/analyze-base64', methods=['POST'])
def analyze_base64():
    """Analyze base64 encoded audio data"""

    try:
        data = request.get_json()

        if not data or 'audioData' not in data:
            return jsonify({'error': 'No audio data provided'}), 400

        audio_base64 = data['audioData']
        mime_type = data.get('mimeType', 'audio/webm')

        # Decode base64
        audio_bytes = base64.b64decode(audio_base64)

        # Load audio
        audio_data, sr = librosa.load(BytesIO(audio_bytes), sr=16000, mono=True)

        # Limit to 30 seconds
        if len(audio_data) / sr > 30:
            audio_data = audio_data[:sr * 30]

        # Analyze
        confidence = analyze_deepfake_probability(audio_data, sr)
        is_deepfake = confidence > 50
        audio_duration = len(audio_data) / sr
        reasoning = get_analysis_reasoning(confidence, audio_duration)

        return jsonify({
            'isDeepfake': is_deepfake,
            'confidence': int(confidence),
            'reasoning': reasoning,
            'verdict': 'ai_clone' if confidence > 65 else ('borderline_human' if confidence > 40 else 'human'),
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/live-analyze', methods=['POST'])
def live_analyze():
    """Analyze live streaming audio chunks"""

    try:
        data = request.get_json()

        if not data or 'audioChunk' not in data:
            return jsonify({'error': 'No audio chunk provided'}), 400

        audio_base64 = data['audioChunk']

        # Decode base64
        audio_bytes = base64.b64decode(audio_base64)
        audio_data, sr = librosa.load(BytesIO(audio_bytes), sr=16000, mono=True)

        # Quick analysis on chunk
        confidence = analyze_deepfake_probability(audio_data, sr)

        return jsonify({
            'confidence': int(confidence),
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
