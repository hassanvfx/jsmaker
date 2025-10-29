// Project types
export interface Project {
  id: string;
  name: string;
  style: string;
  rawLyrics?: string;
  enhancedLyrics?: string;
  createdAt: string;
  updatedAt: string;
  generations?: Generation[];
}

export interface Generation {
  attempt: number;
  timestamp: string;
  sunoId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  errorMessage?: string;
  validation?: ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  confidence: number;
  transcription?: string;
}

export interface ValidationError {
  word: string;
  expected: string;
  got: string;
  timestamp?: number;
}

// Style types
export interface Style {
  id: string;
  name: string;
  description: string;
  genre: string;
  referenceAudio?: string;
}

// Suno API types
export interface SunoGenerateRequest {
  prompt: string;
  lyrics: string;
  style?: string;
  title?: string;
  instrumental?: boolean;
  model?: string;
  continueAt?: number;
  referenceAudioUrl?: string;
}

export interface SunoGenerateResponse {
  id: string;
  status: string;
  audio_url?: string;
  video_url?: string;
  lyric?: string;
  title?: string;
  created_at: string;
}

export interface SunoDetailsResponse {
  id: string;
  status: string;
  audio_url?: string;
  video_url?: string;
  lyric?: string;
  title?: string;
  created_at: string;
  model_name?: string;
}

// OpenAI types
export interface GPTEnhanceRequest {
  lyrics: string;
  style?: string;
}

export interface GPTEnhanceResponse {
  title: string;
  description: string;
  enhancedLyrics: string;
}

export interface WhisperTranscribeRequest {
  audioUrl: string;
}

export interface WhisperTranscribeResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}
