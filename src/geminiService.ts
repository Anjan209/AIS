import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import type { AnalysisSettings } from "../types";

const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";

const updateConfidenceDeclaration: FunctionDeclaration = {
  name: "updateConfidence",
  description: "Updates the real-time confidence level of deepfake detection.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      confidence: {
        type: Type.NUMBER,
        description: "Confidence score from 0 to 100 that the audio is a deepfake.",
      },
      isDeepfake: {
        type: Type.BOOLEAN,
        description: "Whether the audio is currently classified as a deepfake.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Short reasoning for the current confidence level.",
      }
    },
    required: ["confidence", "isDeepfake", "reasoning"],
  },
};

export class GeminiService {
  private getAI(): GoogleGenAI {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }
    return new GoogleGenAI({ apiKey });
  }

  private handleError(error: any): Error {
    console.error("Gemini API Error:", error);
    let errorMessage = "Gemini API failed to connect. Please try again.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Try to parse JSON error from Gemini API
    try {
      const parsedError = JSON.parse(errorMessage);
      if (parsedError.error && parsedError.error.message) {
        errorMessage = parsedError.error.message;
      }
    } catch (e) {
      // Not a JSON string, keep the original message
    }

    return new Error(errorMessage);
  }

  async analyzeAudioFile(base64Data: string, mimeType: string, settings: AnalysisSettings) {
    try {
      const ai = this.getAI();
      const sensitivityPrompt = settings.sensitivity === 'High' 
        ? "Be extremely critical. Flag any minor synthetic artifacts or inconsistencies." 
        : settings.sensitivity === 'Low' 
        ? "Be lenient. Only flag obvious and undeniable synthetic artifacts." 
        : "Use balanced judgment to detect synthetic artifacts.";

      const response = await ai.models.generateContent({
        model: settings.model,
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: `You are an expert deepfake audio detection system. Analyze this audio file to determine if it is a human voice or an AI-generated deepfake/clone.
                
                Pay close attention to:
                1. Spectral consistency and artifacting (robotic tones, metallic sounds, unnatural frequencies).
                2. Breathing patterns and pacing (AI often lacks natural breath sounds or has unnatural pauses).
                3. Emotional prosody (does the emotion match the words, or is it flat/inconsistent?).
                4. Semantic clues (does the speaker explicitly state they are an AI, a bot, or generated?).
                
                ${sensitivityPrompt}
                
                Provide a highly accurate assessment.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDeepfake: {
                type: Type.BOOLEAN,
                description: "Whether the audio is a deepfake.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence score from 0 to 100.",
              },
              reasoning: {
                type: Type.STRING,
                description: "Detailed reasoning for the detection.",
              },
              verdict: {
                type: Type.STRING,
                enum: ['human', 'ai_clone', 'borderline_human'],
                description: "The final verdict of the analysis.",
              },
            },
            required: ["isDeepfake", "confidence", "reasoning", "verdict"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Live session setup
  async connectLive(callbacks: {
    onResult: (result: any) => void;
    onError: (error: any) => void;
    onOpen?: () => void;
  }, settings: AnalysisSettings) {
    let session: any;
    const ai = this.getAI();
    const sensitivityPrompt = settings.sensitivity === 'High' 
      ? "Be extremely critical. Flag any minor synthetic artifacts." 
      : settings.sensitivity === 'Low' 
      ? "Be lenient. Only flag obvious synthetic artifacts." 
      : "Use balanced judgment.";

    try {
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            if (callbacks.onOpen) callbacks.onOpen();
          },
          onmessage: (message) => {
            if (message.toolCall) {
              const call = message.toolCall.functionCalls.find((c: any) => c.name === "updateConfidence");
              if (call && call.args) {
                callbacks.onResult(call.args);
              }
              if (session) {
                session.sendToolResponse({
                  functionResponses: message.toolCall.functionCalls.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    response: { result: "ok" }
                  }))
                });
              }
            }
          },
          onerror: callbacks.onError,
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          tools: [{ functionDeclarations: [updateConfidenceDeclaration] }],
          systemInstruction: `You are an advanced real-time deepfake audio detection system. Monitor the incoming audio stream. Continuously analyze the voice for synthetic artifacts, unnatural breathing, metallic resonance, robotic pacing, and semantic clues (e.g. the speaker identifying as AI). Call the 'updateConfidence' tool frequently to report your real-time confidence level (0-100) that the audio is an AI deepfake. ${sensitivityPrompt} Do not speak or generate text, only call the tool.`,
        },
      });
      session = await sessionPromise;
      return session;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

export const geminiService = new GeminiService();
