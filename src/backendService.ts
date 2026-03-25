const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  reasoning: string;
  verdict: 'ai_clone' | 'borderline_human' | 'human';
  timestamp?: string;
}

export class BackendService {
  async analyzeAudioFile(base64Data: string, mimeType: string): Promise<AnalysisResult> {
    const response = await fetch(`${API_URL}/api/analyze-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64Data,
        mimeType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze audio');
    }

    return response.json();
  }

  async analyzeLiveChunk(base64Data: string): Promise<{ confidence: number }> {
    const response = await fetch(`${API_URL}/api/live-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioChunk: base64Data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze audio chunk');
    }

    return response.json();
  }

  connectLive(callbacks: any): any {
    return {
      sendRealtimeInput: async (data: any) => {
        try {
          if (data.audio) {
            const result = await this.analyzeLiveChunk(data.audio.data);
            callbacks.onResult?.({ confidence: result.confidence });
          }
        } catch (error) {
          callbacks.onError?.(error);
        }
      },
      close: () => {},
    };
  }
}

export const backendService = new BackendService();
