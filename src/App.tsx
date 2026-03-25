import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Mic, MicOff, Upload, Activity, TriangleAlert as AlertTriangle, Volume2, Check, X, Circle as HelpCircle, Cpu, Database, Globe, Smartphone, Download, Settings, FileSliders as Sliders, ChevronDown, History, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { backendService } from './backendService';
import { cn } from './utils';
import type { DetectionResult, AnalysisSettings } from './types';

// HUD Overlay Component
const HUDOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
    {/* Corner Brackets */}
    <div className="absolute top-4 left-4 w-24 h-24 border-t border-l border-theme-500/30 rounded-tl-[40px]" />
    <div className="absolute top-4 right-4 w-24 h-24 border-t border-r border-theme-500/30 rounded-tr-[40px]" />
    <div className="absolute bottom-4 left-4 w-24 h-24 border-b border-l border-theme-500/30 rounded-bl-[40px]" />
    <div className="absolute bottom-4 right-4 w-24 h-24 border-b border-r border-theme-500/30 rounded-br-[40px]" />
    
    {/* Inner Corner Accents */}
    <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-theme-500/50" />
    <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-theme-500/50" />
    <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-theme-500/50" />
    <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-theme-500/50" />
    
    {/* Crosshairs */}
    <div className="absolute top-1/2 left-0 w-12 h-px bg-theme-500/30 -translate-y-1/2" />
    <div className="absolute top-1/2 right-0 w-12 h-px bg-theme-500/30 -translate-y-1/2" />
    <div className="absolute top-0 left-1/2 w-px h-12 bg-theme-500/30 -translate-x-1/2" />
    <div className="absolute bottom-0 left-1/2 w-px h-12 bg-theme-500/30 -translate-x-1/2" />

    {/* Center Reticle */}
    <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-theme-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-theme-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 border-dashed" />

    {/* Random Data Streams */}
    <div className="absolute top-24 left-12 text-[9px] font-mono text-theme-500/60 uppercase tracking-widest flex flex-col gap-2 hidden sm:flex">
      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-theme-500" /> SYS.CORE.V2.0</span>
      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-theme-500" /> MEM: 0x8F3A</span>
      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-theme-500" /> NET: STABLE</span>
      <span className="flex items-center gap-2 animate-pulse"><div className="w-1 h-1 bg-theme-500" /> UPLINK: ACTIVE</span>
    </div>

    <div className="absolute bottom-24 right-12 text-[9px] font-mono text-theme-500/60 uppercase tracking-widest flex flex-col gap-2 text-right hidden sm:flex items-end">
      <span className="flex items-center gap-2 flex-row-reverse"><div className="w-1 h-1 bg-theme-500" /> LATENCY: 12ms</span>
      <span className="flex items-center gap-2 flex-row-reverse"><div className="w-1 h-1 bg-theme-500" /> PACKETS: 1024</span>
      <span className="flex items-center gap-2 flex-row-reverse"><div className="w-1 h-1 bg-theme-500" /> SEC: LEVEL_5</span>
    </div>
    
    {/* Subtle Noise Overlay */}
    <div className="absolute inset-0 bg-noise opacity-[0.04]" />
  </div>
);

// Acoustic Map Component: A real-time spectrogram
const AcousticMap = ({ analyser, isLive }: { analyser: AnalyserNode | null, isLive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLive || !analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const width = canvas.width;
    const height = canvas.height;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      if (tempCtx && ctx) {
        tempCtx.drawImage(canvas, -1, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0);

        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = i / bufferLength;
          const y = height - (percent * height);
          const hue = 160 + (value / 255) * 60;
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${value / 255})`;
          ctx.fillRect(width - 1, y, 1, 1);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLive, analyser]);

  return (
    <div className="relative group w-full h-full">
      <div className="absolute inset-0 bg-theme-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={150} 
        className="w-full h-full bg-theme-900/30 border border-theme-500/20 cursor-crosshair  rounded-2xl shadow-sm"
      />
      <div className="absolute top-4 left-6 text-[10px] font-mono text-theme-500/60 uppercase tracking-wider">Acoustic Spectral Map</div>
      <div className="absolute bottom-4 right-6 text-[10px] font-mono text-theme-500/60 uppercase tracking-wider">{isLive ? 'LIVE FEED' : 'STANDBY'}</div>
    </div>
  );
};

const RadarScanner = ({ isLive, confidence }: { isLive: boolean, confidence: number | null }) => {
  // Generate a stable random position for the blip that only changes when a new blip appears
  const blipPosition = useMemo(() => {
    if (confidence !== null && confidence > 50) {
      return {
        top: `${Math.random() * 60 + 20}%`,
        left: `${Math.random() * 60 + 20}%`
      };
    }
    return null;
  }, [confidence !== null && confidence > 50]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-theme-900/40 border border-theme-500/20  rounded-2xl shadow-sm">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Radar Container - Force Square */}
      <div className="relative w-full max-w-[200px] sm:max-w-[250px] aspect-square flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-theme-500/20 scale-[1.0]" />
        <div className="absolute inset-0 rounded-full border border-theme-500/20 scale-[0.75]" />
        <div className="absolute inset-0 rounded-full border border-theme-500/20 scale-[0.5]" />
        <div className="absolute inset-0 rounded-full border border-theme-500/20 scale-[0.25]" />
        
        {/* Crosshairs */}
        <div className="absolute w-[150%] h-px bg-theme-500/30" />
        <div className="absolute h-[150%] w-px bg-theme-500/30" />

        {isLive && (
          <>
            {/* Radar Sweep */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,color-mix(in_srgb,var(--color-theme-500)_30%,transparent)_360deg)] animate-[spin_4s_linear_infinite]" />
            
            {/* Blips */}
            {blipPosition && confidence !== null && (
              <div 
                className={cn(
                  "absolute w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] animate-pulse",
                  "bg-theme-500 text-theme-500"
                )}
                style={blipPosition}
              >
                <div className="absolute inset-0 rounded-full border border-current animate-ping" />
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="absolute top-4 left-6 text-[10px] font-mono text-theme-500/60 uppercase tracking-wider">Spatial Radar</div>
    </div>
  );
};

export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [liveConfidence, setLiveConfidence] = useState<number | null>(null);
  const [audioExportData, setAudioExportData] = useState<{url: string, filename: string} | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AnalysisSettings>({
    model: 'gemini-3-flash-preview',
    sensitivity: 'Medium',
    threshold: 50,
  });
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'callMonitor'>('scanner');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const liveSessionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (audioExportData) {
        URL.revokeObjectURL(audioExportData.url);
      }
    };
  }, [audioExportData]);

  const triggerAlert = (confidence: number) => {
    if (confidence > settings.threshold && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const startLiveMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsLive(true);
      setError(null);
      setResult(null);
      if (audioExportData) {
        URL.revokeObjectURL(audioExportData.url);
        setAudioExportData(null);
      }
      setLiveConfidence(0);

      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(1000); // Collect chunks every second
      } catch (err) {
        console.error("Failed to start MediaRecorder for live session:", err);
      }

      try {
        const session = backendService.connectLive({
          onResult: (res) => {
            if (res.confidence !== undefined) {
              setLiveConfidence(res.confidence);
            }
          },
          onError: (err) => {
            console.error("Live API Error:", err);
            setError("Connection lost. Please try again.");
            stopLiveMonitoring();
          },
          onOpen: () => {
            console.log("Live API connected.");
          }
        });
        liveSessionRef.current = session;

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          
          const buffer = new ArrayBuffer(pcm16.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(i * 2, pcm16[i], true);
          }
          
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
          }
          const base64 = btoa(binary);

          if (liveSessionRef.current) {
            liveSessionRef.current.sendRealtimeInput({
              audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
            });
          }
        };
      } catch (err: any) {
        console.error("Failed to connect to Live API:", err);
        setError(err.message || "Failed to connect to real-time analysis.");
        stopLiveMonitoring();
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopLiveMonitoring = (isQuickScan: boolean = false) => {
    const currentConfidence = liveConfidence ?? 0;
    
    const cleanup = () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (liveSessionRef.current) {
        try { liveSessionRef.current.close(); } catch (e) {}
        liveSessionRef.current = null;
      }
      
      // Clear temporary audio data to free up resources
      recordedChunksRef.current = [];
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }
      
      setIsLive(false);
      setVolume(0);
      setLiveConfidence(null);
    };

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'ogg';
        
        if (isQuickScan) {
          setAudioExportData(prev => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { url: URL.createObjectURL(blob), filename: `vacha-live-session-${Date.now()}.${ext}` };
          });
          
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Data = (reader.result as string).split(',')[1];
              const analysis = await backendService.analyzeAudioFile(base64Data, mimeType);
              const newResult: DetectionResult = {
                isDeepfake: analysis.isDeepfake,
                confidence: analysis.confidence,
                reasoning: analysis.reasoning,
                verdict: analysis.verdict,
                timestamp: Date.now(),
              };
              setResult(newResult);
              setHistory(prev => [newResult, ...prev]);
              if (newResult.isDeepfake) triggerAlert(newResult.confidence);
              setIsScanning(false);
              setIsAnalyzing(false);
            } catch (err) {
              setError("Scan failed.");
              setIsScanning(false);
              setIsAnalyzing(false);
            }
          };
          reader.readAsDataURL(blob);
        } else {
          // Clear previous export data and do not save the new blob
          setAudioExportData(prev => {
            if (prev) URL.revokeObjectURL(prev.url);
            return null;
          });
          
          const newResult: DetectionResult = {
            isDeepfake: currentConfidence > settings.threshold,
            confidence: currentConfidence,
            reasoning: "Live monitoring session terminated. Temporary audio data cleared to free up resources.",
            verdict: currentConfidence > settings.threshold ? "ai_clone" : "human",
            timestamp: Date.now(),
          };
          setResult(newResult);
          setHistory(prev => [newResult, ...prev]);
        }
        cleanup();
      };
      mediaRecorderRef.current.stop();
    } else {
      if (isQuickScan) {
        setIsScanning(false);
        setIsAnalyzing(false);
      } else {
        setAudioExportData(prev => {
          if (prev) URL.revokeObjectURL(prev.url);
          return null;
        });
      }
      cleanup();
    }
  };

  const performQuickScan = () => {
    if (!streamRef.current) return;
    setIsScanning(true);
    setIsAnalyzing(true);
    setError(null);
    setFeedbackSubmitted(false);
    stopLiveMonitoring(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setFeedbackSubmitted(false);
    if (audioExportData) {
      URL.revokeObjectURL(audioExportData.url);
      setAudioExportData(null);
    }
    setAudioExportData({ url: URL.createObjectURL(file), filename: `vacha-analyzed-${file.name}` });
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const analysis = await backendService.analyzeAudioFile(base64Data, file.type);
          const newResult: DetectionResult = {
            isDeepfake: analysis.isDeepfake,
            confidence: analysis.confidence,
            reasoning: analysis.reasoning,
            verdict: analysis.verdict,
            timestamp: Date.now(),
          };
          setResult(newResult);
          setHistory(prev => [newResult, ...prev]);
          if (newResult.isDeepfake) triggerAlert(newResult.confidence);
        } catch (err: any) {
          setError(err.message || "Analysis failed due to a system error.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the audio file.");
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Analysis failed.");
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = (type: 'correct' | 'incorrect' | 'unsure') => {
    console.log(`Feedback received: ${type}`);
    setFeedbackSubmitted(true);
  };

  const isThreat = result ? result.isDeepfake : (liveConfidence ?? 0) > settings.threshold;
  const isHuman = result ? !result.isDeepfake : (isLive && liveConfidence !== null && liveConfidence <= settings.threshold);
  const themeClass = isThreat ? 'theme-deepfake' : isHuman ? 'theme-human' : 'theme-default';

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-1000 ${themeClass}`}>
      <HUDOverlay />
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-theme-950 transition-colors duration-1000">
        {/* AI Neural Network Abstract Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop")' }}
        />
        
        {/* Dynamic Status Glow */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] blur-[120px] rounded-full transition-colors duration-1000 opacity-30 mix-blend-screen",
          isAnalyzing ? "bg-blue-600" :
          result ? "bg-theme-600" :
          result ? "bg-theme-600" :
          isLive ? "bg-theme-500" : "bg-theme-900"
        )} />
        
        {/* Tech Overlays */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 scanline opacity-20" />
        
        {/* Vignette / Readability Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/40 via-[var(--color-bg-primary)]/80 to-[var(--color-bg-primary)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Top Navigation Bar */}
        <nav className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12  border border-theme-500/20 bg-theme-900/30 backdrop-blur-md px-6 py-4 gap-4 relative overflow-hidden rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-theme-500/50" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-theme-500/20 blur-xl rounded-full animate-pulse-fast" />
              <div className="relative w-14 h-14 bg-theme-500/10 border border-theme-500/50 flex items-center justify-center shadow-glow-theme-lg">
                <Shield className="w-7 h-7 text-theme-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-sans font-black tracking-tighter text-white flex items-center gap-4">
                VACHA SHIELD
                <span className="text-[10px] font-mono bg-theme-500/20 text-theme-400 px-2 py-1 border border-theme-500/50 shadow-glow-theme-sm">PRO</span>
              </h1>
              <p className="text-[10px] font-mono text-theme-500/60 uppercase tracking-widest mt-1">Neural Signal Interceptor v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8 relative z-10">
            <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-theme-500/50" /> Net: <span className="text-theme-400">SECURE</span></span>
              <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-theme-500/50" /> API: <span className="text-theme-400">ONLINE</span></span>
            </div>
            <div className="h-8 w-px bg-theme-500/20 hidden sm:block" />
            <div className="flex items-center gap-3 bg-theme-900/40 px-4 py-2 border border-theme-500/30 shadow-glow-theme">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isLive ? "bg-theme-500 shadow-glow-theme animate-pulse-fast" : "bg-slate-700"
              )} />
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                {isLive ? "Live Link Active" : "Standby Mode"}
              </span>
            </div>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="p-2 border border-theme-500/30 bg-theme-900/40 text-theme-400 hover:bg-theme-500/20 hover:text-theme-300 transition-colors rounded-lg shadow-glow-theme"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 mb-10 border-b border-theme-500/20 pb-4 relative z-10">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={cn(
              "text-xs font-sans font-bold uppercase tracking-wider transition-all relative px-4 py-2 rounded-t-md",
              activeTab === 'scanner' ? "text-theme-400  bg-theme-500/10" : "text-slate-500 hover:text-theme-500/50 hover:bg-theme-500/5"
            )}
          >
            Scanner
            {activeTab === 'scanner' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-theme-500 shadow-glow-theme" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 relative px-4 py-2 rounded-t-md",
              activeTab === 'history' ? "text-theme-400  bg-theme-500/10" : "text-slate-500 hover:text-theme-500/50 hover:bg-theme-500/5"
            )}
          >
            History
            {history.length > 0 && (
              <span className="bg-theme-500/20 text-theme-400 text-[10px] px-2 py-0.5 border border-theme-500/50 font-mono shadow-glow-theme-sm">
                {history.length}
              </span>
            )}
            {activeTab === 'history' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-theme-500 shadow-glow-theme" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('callMonitor')}
            className={cn(
              "text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 relative px-4 py-2 rounded-t-md",
              activeTab === 'callMonitor' ? "text-theme-400  bg-theme-500/10" : "text-slate-500 hover:text-theme-500/50 hover:bg-theme-500/5"
            )}
          >
            Call Monitor
            {activeTab === 'callMonitor' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-theme-500 shadow-glow-theme" />
            )}
          </button>
        </div>

        <main className="space-y-8">
          {activeTab === 'scanner' ? (
            <>
              {/* Analysis Result Display (Moved to Top) */}
          <AnimatePresence mode="wait">
            {(isAnalyzing || result) && (
              <motion.section
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className={cn(
                  "p-8 sm:p-12 relative overflow-hidden  rounded-3xl shadow-2xl transition-all duration-500",
                  isAnalyzing ? "glass-panel" : "glass-theme shadow-theme-900/20"
                )}
              >
                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-theme-500/30 hidden sm:block" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-theme-500/30 hidden sm:block" />

                {isAnalyzing ? (
                  <div className="flex flex-col items-center py-20 sm:py-32 relative z-10">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    <div className="relative w-32 h-32 mb-10">
                      <div className="absolute inset-0 border-2 border-theme-500/20 border-dashed rounded-full animate-spin-slow" />
                      <div className="absolute inset-2 border-2 border-theme-500/40 rounded-full animate-spin-reverse-slow" />
                      <div className="absolute inset-4 border-2 border-t-theme-500 rounded-full animate-spin" />
                      <div className="absolute inset-8 border border-theme-500/60 rounded-full animate-ping" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-theme-400 animate-pulse-fast" />
                      </div>
                    </div>
                    <p className="text-theme-400 font-sans text-lg font-bold tracking-[0.5em] uppercase animate-pulse">Analyzing Signal</p>
                    <div className="mt-6 flex gap-2">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-theme-500 shadow-glow-theme-sm rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                ) : result && (
                  <div className="space-y-10 relative z-10">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-8">
                          <div className={cn(
                            "inline-flex items-center gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-full",
                            "bg-theme-500/20 text-theme-400 border-theme-500/50 shadow-[0_0_20px_var(--theme-glow)]"
                          )}>
                            {result.isDeepfake ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            {result.isDeepfake ? "Threat Detected" : "Authentication Success"}
                          </div>
                          {result.reasoning.toLowerCase().includes('semantic') && (
                            <div className="inline-flex items-center gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider border bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-full">
                              <Activity className="w-5 h-5" />
                              Semantic Hit
                            </div>
                          )}
                        </div>
                        
                        <h3 className={cn(
                          "text-5xl sm:text-7xl lg:text-8xl font-sans font-black tracking-tighter leading-none mb-8 uppercase",
                          "text-theme-400"
                        )}>
                          {result.isDeepfake ? "DEEPFAKE SIGNAL" : "HUMAN VOICE"}
                        </h3>
                        
                        <div className="p-8 bg-theme-900/30 border border-theme-500/20 relative group overflow-hidden rounded-2xl shadow-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-theme-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-theme-500/50" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-theme-500/50" />
                          <p className="text-slate-200 text-sm font-mono leading-relaxed relative z-10">
                            <span className="text-theme-500 mr-3 animate-pulse">_</span>
                            {result.reasoning}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-theme-900/40 p-10 border border-theme-500/20 text-center min-w-[200px] sm:min-w-[280px] relative flex flex-col items-center justify-center overflow-hidden group rounded-2xl shadow-lg">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-500/50 to-transparent opacity-50" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-500/50 to-transparent opacity-50" />
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-theme-500/50 to-transparent opacity-50" />
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-theme-500/50 to-transparent opacity-50" />
                        
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6 relative z-10">Confidence Level</div>
                        <div className={cn(
                          "text-7xl sm:text-9xl font-sans font-black tracking-tighter relative z-10",
                          "text-theme-400"
                        )}>
                          {result.confidence}<span className="text-4xl opacity-50">%</span>
                        </div>
                        <div className="mt-8 w-full h-2 bg-theme-500/10 overflow-hidden relative z-10">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={cn(
                              "h-full relative",
                              "bg-theme-500"
                            )}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] animate-scan" />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Form and Export */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-theme-500/20 relative z-10">
                      {!feedbackSubmitted ? (
                        <div className="p-8 bg-theme-900/30 border border-theme-500/20 flex-1 relative group overflow-hidden  rounded-2xl shadow-lg">
                          <div className="absolute inset-0 bg-gradient-to-r from-theme-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-500/20 group-hover:bg-theme-500/80 transition-colors" />
                          <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest mb-6 relative z-10">Operator Feedback Required</h4>
                          <div className="flex flex-wrap gap-4 relative z-10">
                            <button 
                              onClick={() => handleFeedback('correct')}
                              className="flex items-center gap-3 px-6 py-3 bg-theme-500/10 text-theme-400 border border-theme-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-theme-500/20 hover:shadow-glow-theme hover:-translate-y-0.5 transition-all rounded-xl"
                            >
                              <Check className="w-4 h-4" /> Confirmed
                            </button>
                            <button 
                              onClick={() => handleFeedback('incorrect')}
                              className="flex items-center gap-3 px-6 py-3 bg-theme-500/10 text-theme-400 border border-theme-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-theme-500/20 hover:shadow-glow-theme hover:-translate-y-0.5 transition-all rounded-xl"
                            >
                              <X className="w-4 h-4" /> False Positive
                            </button>
                            <button 
                              onClick={() => handleFeedback('unsure')}
                              className="flex items-center gap-3 px-6 py-3 bg-slate-400/10 text-slate-300 border border-slate-400/30 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-slate-400/20 hover:text-white hover:-translate-y-0.5 transition-all rounded-xl"
                            >
                              <HelpCircle className="w-4 h-4" /> Inconclusive
                            </button>
                          </div>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-8 bg-theme-500/10 border border-theme-500/30 flex items-center justify-center gap-4 flex-1 relative overflow-hidden "
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,color-mix(in_srgb,var(--color-theme-500)_10%,transparent)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-scan" />
                          <Check className="w-6 h-6 text-theme-400 relative z-10" />
                          <p className="text-[12px] font-mono font-bold text-theme-400 uppercase tracking-widest relative z-10">Feedback Logged to Neural Core</p>
                        </motion.div>
                      )}

                      {audioExportData && (
                        <a 
                          href={audioExportData.url}
                          download={audioExportData.filename}
                          className="p-6 bg-theme-900/30 border border-theme-500/20 flex flex-col items-center justify-center gap-2 hover:bg-theme-500/10 hover:border-theme-500/50 transition-all text-slate-300 hover:text-theme-400 shrink-0 min-w-[160px] group  rounded-2xl shadow-lg hover:-translate-y-1"
                        >
                          <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Export Log</span>
                        </a>
                      )}
                    </div>

                    {result.isDeepfake && (
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-start gap-4 p-6 bg-theme-500/10 border border-theme-500/30 relative overflow-hidden rounded-2xl shadow-lg shadow-theme-900/20"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-theme-500" />
                        <div className="p-2 bg-theme-500/20 shrink-0 mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-theme-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-mono font-bold text-theme-400 uppercase tracking-wider mb-1">Critical Security Alert</h4>
                          <p className="text-xs text-theme-400/80 font-mono leading-relaxed">Synthetic voice patterns detected. This signal is highly likely to be AI-generated. Proceed with extreme caution.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Live Spectral Diagnostics (Always visible when active) */}
          <AnimatePresence>
            {(isLive || isAnalyzing || isScanning) && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-6 sm:p-8 overflow-hidden border-theme-500/20  relative rounded-3xl shadow-2xl mb-8"
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-theme-500/30" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-theme-500 shadow-[0_0_8px_color-mix(in srgb, var(--color-theme-500) 80%, transparent)] animate-pulse-fast" />
                    <h3 className="text-[10px] font-mono font-bold text-theme-500/80 uppercase tracking-widest">Acoustic Spectral Analysis</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Range: 0Hz — 22.1kHz</span>
                </div>
                <div className="bg-theme-900/40 border border-theme-500/20 overflow-hidden relative z-10  rounded-2xl shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-theme-500/5 to-transparent pointer-events-none" />
                  <AcousticMap analyser={analyserRef.current} isLive={isLive} />
                </div>
                <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider relative z-10">
                  <span>Low Freq (Bass)</span>
                  <span>Mid Range</span>
                  <span>High Freq (Treble)</span>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Main Control & Visualizer */}
          <div className="space-y-8">
            <section className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden  shadow-2xl">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-theme-500/30 hidden sm:block" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-theme-500/30 hidden sm:block" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12 relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-sans font-black text-white mb-2 flex items-center gap-4 tracking-tighter uppercase">
                    <Activity className="w-8 h-8 text-theme-400 animate-pulse-fast" />
                    Signal Analysis
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-wider">Monitoring real-time vocal frequency patterns</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {isLive && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => performQuickScan()}
                      disabled={isScanning}
                      className="flex items-center gap-3 px-6 py-3 font-sans font-bold text-[10px] uppercase tracking-[0.2em] bg-theme-900/20 text-theme-400 border border-theme-500/50 hover:bg-theme-500/20 disabled:opacity-50 transition-all rounded-xl"
                    >
                      {isScanning ? <div className="w-4 h-4 border-2 border-theme-500/20 border-t-theme-400 rounded-full animate-spin" /> : <Activity className="w-4 h-4" />}
                      [ Quick Scan ]
                    </motion.button>
                  )}
                  <button 
                    onClick={() => isLive ? stopLiveMonitoring() : startLiveMonitoring()}
                    className={cn(
                      "flex items-center gap-3 px-8 py-3 font-sans font-black text-[12px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group rounded-xl",
                      isLive 
                        ? "bg-theme-500/10 text-theme-500 border border-theme-500/50 hover:bg-theme-500/20" 
                        : "bg-theme-500/10 text-theme-400 border border-theme-500/50 hover:bg-theme-500/20"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity",
                      "bg-theme-500"
                    )} />
                    {isLive ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5 relative z-10" />}
                    <span className="relative z-10">{isLive ? "TERMINATE LINK" : "INITIATE LINK"}</span>
                  </button>
                </div>
              </div>

              {/* Advanced Visualizer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 relative z-10">
                {/* Waveform Visualizer */}
                <div className="lg:col-span-2 min-h-[300px] sm:min-h-[400px] bg-theme-900/40 border border-theme-500/20 flex items-center justify-center relative overflow-hidden group  rounded-2xl shadow-sm">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  {isLive && <div className="absolute inset-x-0 h-[2px] bg-theme-500/80 shadow-glow-theme-lg z-20 animate-scan" />}
                  {!isLive ? (
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <div className="w-16 h-16 border border-theme-500/20 flex items-center justify-center animate-pulse shadow-glow-theme">
                        <Activity className="w-6 h-6 text-theme-500/50" />
                      </div>
                      <span className="text-[10px] font-mono text-theme-500/50 uppercase tracking-widest animate-pulse">Awaiting Signal</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 h-40 px-8 w-full relative z-10">
                      {[...Array(64)].map((_, i) => {
                        const distance = Math.abs(i - 32) / 32;
                        const multiplier = Math.max(0.1, 1 - distance * 0.9);
                        return (
                          <motion.div
                            key={i}
                            animate={{ 
                              height: Math.max(4, (volume / 255) * 100 * multiplier * (Math.random() * 0.6 + 0.4)) + "%",
                              opacity: Math.max(0.4, (volume / 255) * multiplier + 0.3)
                            }}
                            transition={{ duration: 0.05 }}
                            className="flex-1 bg-theme-500 shadow-glow-theme-sm"
                          />
                        );
                      })}
                    </div>
                  )}
                  <div className="absolute top-4 left-6 text-[10px] font-mono text-theme-500/60 uppercase tracking-wider">Waveform Spectrum // 0-22kHz</div>
                  <div className="absolute bottom-4 right-6 text-[10px] font-mono text-theme-500/60 uppercase tracking-wider">{isLive ? 'ACTIVE' : 'OFFLINE'}</div>
                </div>

                <div className="min-h-[300px] sm:min-h-[400px] flex flex-col gap-6">
                  <div className="flex-1 relative">
                    <AcousticMap isLive={isLive} analyser={analyserRef.current} />
                  </div>
                  <div className="flex-1 relative">
                    <RadarScanner isLive={isLive} confidence={liveConfidence} />
                  </div>
                </div>
              </div>

              {/* Threat Level Meter */}
              <div className="mb-10 p-10 bg-theme-900/40 border border-theme-500/20 relative z-10  rounded-2xl shadow-lg">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-theme-900/40 border border-theme-500/30 flex items-center justify-center shadow-glow-theme">
                      <AlertTriangle className={cn("w-6 h-6", "text-theme-500 " + ((result?.isDeepfake || (liveConfidence ?? 0) > settings.threshold) ? "animate-pulse" : ""))} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Neural Threat Level</span>
                      <span className="block text-sm font-sans font-bold text-white uppercase tracking-wider">System Status</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "block text-3xl font-sans font-black uppercase tracking-widest",
                      "text-theme-500 " + ((result?.isDeepfake || (liveConfidence ?? 0) > settings.threshold) ? "animate-pulse" : "")
                    )}>
                      {(result?.isDeepfake || (liveConfidence ?? 0) > settings.threshold) ? "CRITICAL" : "SECURE"}
                    </span>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="h-8 bg-theme-900/40 border border-theme-500/20 overflow-hidden flex gap-1 p-1 rounded-xl shadow-sm">
                    {[...Array(20)].map((_, i) => {
                      const confidenceToUse = result ? result.confidence : (liveConfidence ?? 0);
                      const isThreat = result ? result.isDeepfake : (liveConfidence ?? 0) > settings.threshold;
                      const isActive = i < (confidenceToUse / 5);
                      
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex-1 transition-all duration-300",
                            isActive ? "bg-theme-500 shadow-[0_0_15px_var(--theme-glow)]" : "bg-theme-500/10"
                          )}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {isLive && liveConfidence !== null && (
                  <div className="mt-16 flex justify-between items-center border-t border-theme-500/20 pt-8 relative z-10">
                    <span className="text-[10px] font-mono text-theme-500/60 uppercase tracking-widest flex items-center gap-4">
                      <div className="w-2 h-2 bg-theme-500 shadow-glow-theme-sm animate-pulse-fast" />
                      Real-time Confidence
                    </span>
                    <span className={cn(
                      "text-4xl font-sans font-black tracking-tighter",
                      "text-theme-500"
                    )}>{liveConfidence}<span className="text-xl opacity-50">%</span></span>
                  </div>
                )}
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <label className="flex flex-col items-center justify-center p-10 bg-theme-900/30 border border-theme-500/20 hover:border-theme-500/50 hover:bg-theme-500/10 transition-all cursor-pointer group relative overflow-hidden  rounded-2xl shadow-lg hover:shadow-theme-500/10 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="w-20 h-20 bg-theme-900/40 border border-theme-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10 shadow-glow-theme group-hover:shadow-glow-theme-lg">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-theme-500" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-theme-500" />
                    <Upload className="w-8 h-8 text-theme-500/50 group-hover:text-theme-400 transition-colors" />
                  </div>
                  <span className="text-lg font-sans font-bold text-slate-200 group-hover:text-theme-400 transition-colors uppercase tracking-wider relative z-10">Upload Evidence</span>
                  <span className="text-[10px] font-mono text-theme-500/40 mt-3 uppercase tracking-widest relative z-10">MP3 // WAV // WEBM</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
                
                <div className="p-10 bg-theme-900/30 border border-theme-500/20 flex flex-col justify-center relative overflow-hidden group  rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Cpu className="w-24 h-24 text-theme-500" />
                  </div>
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4 text-theme-500/80 text-[10px] font-mono uppercase tracking-widest">
                      <div className="w-2 h-2 bg-theme-500 shadow-glow-theme-sm animate-pulse-fast" />
                      Neural Engine
                    </div>
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-3 bg-theme-900/40 hover:bg-theme-500/20 transition-colors border border-theme-500/30 hover:border-theme-500/80 text-theme-500/50 hover:text-theme-400"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-4xl sm:text-5xl font-sans font-black text-white tracking-tighter relative z-10 uppercase ">
                    OPTIMIZED
                    <span className="block text-[10px] font-mono text-theme-500/60 font-normal mt-3 tracking-widest uppercase">
                      {settings.model.replace('-preview', '').replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="p-8 sm:p-12 bg-theme-900/40 border border-theme-500/30 relative  rounded-3xl shadow-2xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-theme-500" />
                      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                      
                      <div className="flex items-center gap-6 mb-12 border-b border-theme-500/20 pb-8 relative z-10">
                        <div className="w-12 h-12 bg-theme-500/10 border border-theme-500/30 flex items-center justify-center shadow-glow-theme">
                          <Sliders className="w-6 h-6 text-theme-400" />
                        </div>
                        <h3 className="text-xl font-sans font-bold text-white uppercase tracking-widest">System Configuration</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        <div className="space-y-6">
                          <label className="block text-[10px] font-mono font-bold text-theme-500/80 uppercase tracking-widest">AI Model Core</label>
                          <div className="relative group">
                            <select 
                              value={settings.model}
                              onChange={(e) => setSettings({...settings, model: e.target.value})}
                              className="w-full bg-theme-900/30 border border-theme-500/30 text-theme-400 text-xs font-mono p-5 appearance-none focus:outline-none focus:border-theme-500/80 transition-colors uppercase tracking-[0.2em] group-hover:bg-theme-500/10 group-hover:border-theme-500/50 cursor-pointer shadow-[inset_0_0_10px_color-mix(in_srgb,var(--color-theme-500)_5%,transparent)] rounded-2xl"
                            >
                              <option value="gemini-3-flash-preview">Flash Core (Fast)</option>
                              <option value="gemini-3.1-pro-preview">Pro Core (Deep)</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-500/50 pointer-events-none group-hover:text-theme-400 transition-colors" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase tracking-widest">
                            Select the neural processing core. Pro offers deeper semantic analysis.
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                          <label className="block text-[10px] font-mono font-bold text-theme-500/80 uppercase tracking-widest">Detection Sensitivity</label>
                          <div className="relative group">
                            <select 
                              value={settings.sensitivity}
                              onChange={(e) => setSettings({...settings, sensitivity: e.target.value as any})}
                              className="w-full bg-theme-900/30 border border-theme-500/30 text-theme-400 text-xs font-mono p-5 appearance-none focus:outline-none focus:border-theme-500/80 transition-colors uppercase tracking-[0.2em] group-hover:bg-theme-500/10 group-hover:border-theme-500/50 cursor-pointer shadow-[inset_0_0_10px_color-mix(in_srgb,var(--color-theme-500)_5%,transparent)] rounded-2xl"
                            >
                              <option value="High">High (Maximum Security)</option>
                              <option value="Medium">Medium (Balanced)</option>
                              <option value="Low">Low (Fewer False Positives)</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-500/50 pointer-events-none group-hover:text-theme-400 transition-colors" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase tracking-widest">
                            Adjusts the strictness of the anomaly detection algorithms.
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-mono font-bold text-theme-500/80 uppercase tracking-widest">Alert Threshold</label>
                            <span className="text-xl font-sans font-black text-theme-400 ">{settings.threshold}%</span>
                          </div>
                          <div className="relative pt-2 pb-4">
                            <input 
                              type="range" 
                              min="10" 
                              max="90" 
                              step="5"
                              value={settings.threshold}
                              onChange={(e) => setSettings({...settings, threshold: parseInt(e.target.value)})}
                              className="w-full h-1 bg-theme-500/20 rounded-none appearance-none cursor-pointer accent-theme-500 relative z-10"
                            />
                            <div className="absolute top-1/2 left-0 w-full h-px bg-theme-500/30 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase tracking-widest">
                            Confidence level required to trigger a critical threat alert.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            </div>
            </>
          ) : activeTab === 'history' ? (
            /* Analysis History Section */
            <section className="glass-panel p-8 sm:p-12 relative overflow-hidden  rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              
              <div className="flex items-center gap-6 mb-10 relative z-10 border-b border-theme-500/20 pb-8">
                <div className="w-16 h-16 bg-theme-900/30 border border-theme-500/30 flex items-center justify-center relative shadow-glow-theme-lg">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-theme-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-theme-500" />
                  <History className="w-8 h-8 text-theme-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-sans font-black text-white uppercase tracking-wider">Analysis History</h2>
                  <p className="text-[10px] font-mono text-theme-500/60 uppercase tracking-widest mt-2">Recent detection logs and verdicts</p>
                </div>
              </div>
              
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center relative z-10 bg-theme-900/10 border border-theme-500/10 ">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/30" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-theme-500/30" />
                  <div className="w-32 h-32 bg-theme-500/5 border border-theme-500/20 flex items-center justify-center mb-8 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-theme-500/10 group-hover:bg-theme-500/20 transition-colors" />
                    <History className="w-12 h-12 text-theme-500/50 group-hover:text-theme-400 transition-colors relative z-10" />
                    <div className="absolute inset-0 border border-theme-500/30 rounded-full scale-[1.5] animate-ping opacity-20" />
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-theme-500/50 uppercase tracking-widest">No History Yet</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-4 max-w-md uppercase tracking-widest leading-relaxed">
                    Run a live scan or upload an audio file to populate the analysis history log.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 relative z-10">
                  {history.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-theme-900/40 border border-theme-500/20 hover:border-theme-500/60 transition-all group relative overflow-hidden  rounded-2xl shadow-lg hover:shadow-theme-500/10 hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-theme-500/20 group-hover:bg-theme-500/80 transition-colors" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-theme-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-theme-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center gap-8 pl-6 relative z-10">
                        <div className={cn(
                          "w-6 h-6 shrink-0 border-2",
                          "bg-theme-500/20 border-theme-500 shadow-[0_0_20px_var(--theme-glow)]"
                        )} />
                        <div>
                          <div className={cn(
                            "text-lg font-sans font-bold uppercase tracking-widest",
                            "text-theme-400"
                          )}>
                            {item.verdict === 'ai_clone' ? 'AI CLONE' : item.verdict === 'borderline_human' ? 'BORDERLINE' : 'HUMAN'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-theme-500/50">{'>'}</span>
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 sm:text-right bg-theme-900/30 sm:bg-transparent p-6 sm:p-0 mt-6 sm:mt-0 border-t border-theme-500/20 sm:border-0 relative z-10">
                        <div className="flex flex-col items-end">
                          <div className={cn(
                            "text-4xl font-sans font-black tracking-tighter",
                            "text-theme-400"
                          )}>{item.confidence}<span className="text-xl opacity-50">%</span></div>
                          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-2">Confidence</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* Call Monitor Section */
            <section className="glass-panel p-8 sm:p-12 relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <div className="flex items-center gap-6 mb-10 relative z-10 border-b border-theme-500/20 pb-8">
                <div className="w-16 h-16 bg-theme-900/30 border border-theme-500/30 flex items-center justify-center relative shadow-glow-theme-lg">
                  <Smartphone className="w-8 h-8 text-theme-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-sans font-black text-white uppercase tracking-wider">WhatsApp Call Monitor</h2>
                  <p className="text-[10px] font-mono text-theme-500/60 uppercase tracking-widest mt-2">Real-time voice analysis for active calls</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Instructions */}
                <div className="bg-theme-900/40 border border-theme-500/20 p-8 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-sans font-bold text-theme-400 uppercase tracking-widest mb-6">Setup Instructions</h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 shrink-0 bg-theme-500/20 border border-theme-500/50 rounded-full flex items-center justify-center text-theme-400 font-bold font-mono text-sm">1</div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 uppercase tracking-wider">Start WhatsApp Call</p>
                        <p className="text-xs text-slate-400 font-mono mt-1">Initiate or answer a voice/video call on your device.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 shrink-0 bg-theme-500/20 border border-theme-500/50 rounded-full flex items-center justify-center text-theme-400 font-bold font-mono text-sm">2</div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 uppercase tracking-wider">Enable Speakerphone</p>
                        <p className="text-xs text-slate-400 font-mono mt-1">Crucial: The app needs to hear the other person through your device's microphone.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 shrink-0 bg-theme-500/20 border border-theme-500/50 rounded-full flex items-center justify-center text-theme-400 font-bold font-mono text-sm">3</div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 uppercase tracking-wider">Initiate Monitoring</p>
                        <p className="text-xs text-slate-400 font-mono mt-1">Click the button below to start real-time deepfake analysis.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Monitor Control */}
                <div className={cn(
                  "flex flex-col items-center justify-center border p-8 rounded-2xl shadow-sm text-center transition-all duration-500",
                  isLive && liveConfidence !== null && liveConfidence > settings.threshold 
                    ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.2)]" 
                    : "bg-theme-900/40 border-theme-500/20"
                )}>
                  <div className="mb-8">
                    {isLive ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <div className={cn("absolute inset-0 border-2 border-dashed rounded-full animate-spin-slow", liveConfidence !== null && liveConfidence > settings.threshold ? "border-rose-500/20" : "border-theme-500/20")} />
                        <div className={cn("absolute inset-2 border-2 rounded-full animate-spin-reverse-slow", liveConfidence !== null && liveConfidence > settings.threshold ? "border-rose-500/40" : "border-theme-500/40")} />
                        <div className={cn("absolute inset-4 border-2 rounded-full animate-spin", liveConfidence !== null && liveConfidence > settings.threshold ? "border-t-rose-500 border-rose-500/20" : "border-t-theme-500 border-theme-500/20")} />
                        <div className={cn("absolute inset-0 rounded-full animate-ping", liveConfidence !== null && liveConfidence > settings.threshold ? "bg-rose-500/20" : "bg-theme-500/20")} style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mic className={cn("w-8 h-8 animate-pulse-fast", liveConfidence !== null && liveConfidence > settings.threshold ? "text-rose-500" : "text-theme-400")} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-theme-900/40 border border-theme-500/30 rounded-full flex items-center justify-center shadow-glow-theme">
                        <MicOff className="w-8 h-8 text-theme-500/50" />
                      </div>
                    )}
                  </div>

                  {isLive && liveConfidence !== null && (
                    <div className="mb-8">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Live Threat Level</div>
                      <div className={cn(
                        "text-5xl font-sans font-black tracking-tighter",
                        liveConfidence > settings.threshold ? "text-rose-500 animate-pulse" : "text-theme-400"
                      )}>
                        {liveConfidence}<span className="text-2xl opacity-50">%</span>
                      </div>
                      <div className="text-xs font-mono mt-2 text-slate-300">
                        {liveConfidence > settings.threshold ? "⚠️ SYNTHETIC VOICE DETECTED" : "✅ HUMAN VOICE VERIFIED"}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => isLive ? stopLiveMonitoring() : startLiveMonitoring()}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 font-sans font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group w-full justify-center rounded-xl",
                      isLive 
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20" 
                        : "bg-theme-500/10 text-theme-400 border border-theme-500/50 hover:bg-theme-500/20"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity",
                      isLive ? "bg-rose-500" : "bg-theme-500"
                    )} />
                    {isLive ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5 relative z-10" />}
                    <span className="relative z-10">{isLive ? "STOP MONITORING" : "START MONITORING"}</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-theme-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">VACHA SHIELD <span className="text-theme-500">v2.0.0</span></div>
            <div className="h-4 w-px bg-theme-500/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[9px] font-mono text-theme-500/80 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-theme-500 shadow-[0_0_8px_color-mix(in srgb, var(--color-theme-500) 80%, transparent)] animate-pulse-fast" />
                Neural Link Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-10 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            <a href="#" className="hover:text-theme-400 transition-colors flex items-center gap-2"><Smartphone className="w-3 h-3" /> Mobile App</a>
            <a href="#" className="hover:text-theme-400 transition-colors">Security</a>
            <a href="#" className="hover:text-theme-400 transition-colors">Privacy</a>
          </div>
        </footer>
      </div>

      {/* Global Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-4 bg-theme-950/90 text-rose-400 text-sm font-mono font-bold shadow-[0_0_50px_rgba(244,63,94,0.2)] flex items-center gap-4 z-50 border border-rose-500/50 w-[90%] sm:w-auto uppercase tracking-widest  rounded-2xl"
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-rose-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-rose-500" />
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="flex-1 ">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 w-6 h-6 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-300 transition-colors">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
