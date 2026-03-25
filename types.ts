export interface AnalysisSettings {
  model: string;
  sensitivity: 'Low' | 'Medium' | 'High';
  threshold: number;
}

export interface DetectionResult {
  isDeepfake: boolean;
  confidence: number;
  reasoning: string;
  timestamp: number;
  verdict?: 'human' | 'ai_clone' | 'borderline_human';
  profile?: string;
  feedback?: 'correct' | 'incorrect' | 'unsure';
}

export interface AudioStats {
  volume: number;
  frequencyData: Uint8Array;
}
