/**
 * Complete Suno API Service Implementation
 * Based on https://docs.sunoapi.org/
 * 
 * Provides all 21 endpoints for:
 * - Music Generation (8 endpoints)
 * - Lyrics (2 endpoints)  
 * - Audio Processing (3 endpoints)
 * - Music Video (1 endpoint)
 * - Status/Details (7 endpoints)
 */

import axios, { AxiosInstance } from 'axios';
import type {
  SunoApiResponse,
  TaskIdResponse,
  GenerateMusicRequest,
  ExtendMusicRequest,
  UploadAndCoverRequest,
  UploadAndExtendRequest,
  AddInstrumentalRequest,
  AddVocalsRequest,
  CoverMusicRequest,
  BoostMusicStyleRequest,
  MusicGenerationDetails,
  GenerateLyricsRequest,
  LyricsGenerationDetails,
  GetTimestampedLyricsRequest,
  TimestampedLyricsResponse,
  SeparateVocalsRequest,
  VocalSeparationDetails,
  ConvertToWavRequest,
  WavConversionDetails,
  GeneratePersonaRequest,
  PersonaDetails,
  CreateMusicVideoRequest,
  MusicVideoDetails,
  RemainingCreditsResponse,
  CoverDetails,
  SunoModel,
} from '../types/suno-api';

// ============================================================================
// Configuration
// ============================================================================

const SUNO_API_BASE = 'https://api.sunoapi.org';
const SUNO_API_KEY = import.meta.env.VITE_SUNO_API_KEY;
const DEFAULT_MODEL: SunoModel = (import.meta.env.VITE_SUNO_MODEL_VERSION as SunoModel) || 'V5';
const DEFAULT_CALLBACK_URL = 'https://api.example.com/callback'; // Replace with your callback URL

// ============================================================================
// Axios Instance
// ============================================================================

const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: SUNO_API_BASE,
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
};

const api = createAxiosInstance();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract task ID from API response
 */
function extractTaskId(response: SunoApiResponse<TaskIdResponse>): string {
  if (response.code !== 200) {
    throw new Error(response.msg || 'API request failed');
  }
  return response.data.taskId;
}

/**
 * Poll until task completes or times out
 */
async function pollUntilComplete<T>(
  getDetailsFn: () => Promise<T & { status: string }>,
  maxAttempts = 60,
  interval = 5000
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    const details = await getDetailsFn();
    
    if (details.status === 'complete' || details.status === 'completed') {
      return details;
    }
    
    if (details.status === 'error') {
      throw new Error('Generation failed with error status');
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Generation timeout after ${maxAttempts} attempts`);
}

// ============================================================================
// MUSIC GENERATION APIs (8 endpoints)
// ============================================================================

export const sunoService = {
  
  /**
   * Generate Music - Create music from text description
   * Endpoint: POST /api/v1/generate
   * 
   * @param params - Generation parameters
   * @returns Task ID for tracking generation
   */
  async generateMusic(params: {
    prompt: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
    personaId?: string;
    negativeTags?: string;
    vocalGender?: 'm' | 'f';
    styleWeight?: number;
    weirdnessConstraint?: number;
    audioWeight?: number;
  }): Promise<string> {
    const request: GenerateMusicRequest = {
      customMode: params.customMode ?? true,
      instrumental: params.instrumental ?? false,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
      personaId: params.personaId,
      negativeTags: params.negativeTags,
      vocalGender: params.vocalGender,
      styleWeight: params.styleWeight,
      weirdnessConstraint: params.weirdnessConstraint,
      audioWeight: params.audioWeight,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Extend Music - Continue existing track from timestamp
   * Endpoint: POST /api/v1/extend
   */
  async extendMusic(params: {
    audioId: string;
    continueAt: number;
    prompt?: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<string> {
    const request: ExtendMusicRequest = {
      audioId: params.audioId,
      continueAt: params.continueAt,
      customMode: params.customMode ?? true,
      instrumental: params.instrumental ?? false,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/extend',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Upload and Cover Audio - Remix with reference audio
   * Endpoint: POST /api/v1/generate/upload-cover
   * 
   * This is the correct endpoint for remixing!
   */
  async uploadAndCover(params: {
    uploadUrl: string;
    prompt?: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<string> {
    const request: UploadAndCoverRequest = {
      uploadUrl: params.uploadUrl,
      customMode: params.customMode ?? true,
      instrumental: params.instrumental ?? false,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate/upload-cover',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Upload and Extend Audio - Upload file and extend it
   * Endpoint: POST /api/v1/generate/upload-extend
   */
  async uploadAndExtend(params: {
    uploadUrl: string;
    continueAt: number;
    prompt?: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<string> {
    const request: UploadAndExtendRequest = {
      uploadUrl: params.uploadUrl,
      continueAt: params.continueAt,
      customMode: params.customMode ?? true,
      instrumental: params.instrumental ?? false,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate/upload-extend',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Add Instrumental - Generate instrumental for vocals
   * Endpoint: POST /api/v1/generate/add-instrumental
   */
  async addInstrumental(params: {
    audioId: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    model?: SunoModel;
  }): Promise<string> {
    const request: AddInstrumentalRequest = {
      audioId: params.audioId,
      customMode: params.customMode ?? true,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      style: params.style,
      title: params.title,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate/add-instrumental',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Add Vocals - Generate vocals for instrumental
   * Endpoint: POST /api/v1/generate/add-vocals
   */
  async addVocals(params: {
    audioId: string;
    prompt?: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    model?: SunoModel;
    vocalGender?: 'm' | 'f';
  }): Promise<string> {
    const request: AddVocalsRequest = {
      audioId: params.audioId,
      customMode: params.customMode ?? true,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
      vocalGender: params.vocalGender,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate/add-vocals',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Cover Music - Generate music cover
   * Endpoint: POST /api/v1/cover
   */
  async coverMusic(params: {
    audioId: string;
    prompt?: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<string> {
    const request: CoverMusicRequest = {
      audioId: params.audioId,
      customMode: params.customMode ?? true,
      instrumental: params.instrumental ?? false,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
      prompt: params.prompt,
      style: params.style,
      title: params.title,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/cover',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Boost Music Style - Enhance music style
   * Endpoint: POST /api/v1/boost-music-style
   */
  async boostMusicStyle(params: {
    audioId: string;
    model?: SunoModel;
  }): Promise<string> {
    const request: BoostMusicStyleRequest = {
      audioId: params.audioId,
      model: params.model || DEFAULT_MODEL,
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/boost-music-style',
      request
    );
    
    return extractTaskId(response.data);
  },

  // ============================================================================
  // LYRICS APIs (2 endpoints)
  // ============================================================================

  /**
   * Generate Lyrics - Create AI-powered lyrics
   * Endpoint: POST /api/v1/generate/lyrics
   */
  async generateLyrics(params: {
    prompt: string;
  }): Promise<string> {
    const request: GenerateLyricsRequest = {
      prompt: params.prompt,
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/generate/lyrics',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Get Timestamped Lyrics - Retrieve synced lyrics
   * Endpoint: POST /api/v1/lyrics/timestamped
   */
  async getTimestampedLyrics(params: {
    audioId: string;
  }): Promise<TimestampedLyricsResponse> {
    const request: GetTimestampedLyricsRequest = {
      audioId: params.audioId,
    };

    const response = await api.post<SunoApiResponse<TimestampedLyricsResponse>>(
      '/api/v1/lyrics/timestamped',
      request
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get timestamped lyrics');
    }
    
    return response.data.data;
  },

  // ============================================================================
  // AUDIO PROCESSING APIs (3 endpoints)
  // ============================================================================

  /**
   * Separate Vocals - Extract vocals and instrumental
   * Endpoint: POST /api/v1/separate-vocals
   */
  async separateVocals(params: {
    audioUrl: string;
    model?: string;
  }): Promise<string> {
    const request: SeparateVocalsRequest = {
      audioUrl: params.audioUrl,
      model: params.model || 'default',
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/separate-vocals',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Convert to WAV - Convert audio to WAV format
   * Endpoint: POST /api/v1/convert-wav
   */
  async convertToWav(params: {
    audioId: string;
  }): Promise<string> {
    const request: ConvertToWavRequest = {
      audioId: params.audioId,
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/convert-wav',
      request
    );
    
    return extractTaskId(response.data);
  },

  /**
   * Generate Persona - Create music persona from audio
   * Endpoint: POST /api/v1/generate/persona
   */
  async generatePersona(params: {
    audioId: string;
  }): Promise<PersonaDetails> {
    const request: GeneratePersonaRequest = {
      audioId: params.audioId,
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<PersonaDetails>>(
      '/api/v1/generate/persona',
      request
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to generate persona');
    }
    
    return response.data.data;
  },

  // ============================================================================
  // MUSIC VIDEO API (1 endpoint)
  // ============================================================================

  /**
   * Create Music Video - Generate video from audio
   * Endpoint: POST /api/v1/create-music-video
   */
  async createMusicVideo(params: {
    audioId: string;
    imageUrl?: string;
    videoPrompt?: string;
  }): Promise<string> {
    const request: CreateMusicVideoRequest = {
      audioId: params.audioId,
      imageUrl: params.imageUrl,
      videoPrompt: params.videoPrompt,
      callBackUrl: DEFAULT_CALLBACK_URL,
    };

    const response = await api.post<SunoApiResponse<TaskIdResponse>>(
      '/api/v1/create-music-video',
      request
    );
    
    return extractTaskId(response.data);
  },

  // ============================================================================
  // STATUS/DETAILS APIs (7 endpoints)
  // ============================================================================

  /**
   * Get Music Generation Details - Check generation status
   * Endpoint: GET /api/v1/details
   */
  async getMusicDetails(taskId: string): Promise<MusicGenerationDetails> {
    const response = await api.get<SunoApiResponse<MusicGenerationDetails>>(
      `/api/v1/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get music details');
    }
    
    return response.data.data;
  },

  /**
   * Get Lyrics Generation Details - Check lyrics status
   * Endpoint: GET /api/v1/lyrics/details
   */
  async getLyricsDetails(taskId: string): Promise<LyricsGenerationDetails> {
    const response = await api.get<SunoApiResponse<LyricsGenerationDetails>>(
      `/api/v1/lyrics/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get lyrics details');
    }
    
    return response.data.data;
  },

  /**
   * Get WAV Conversion Details - Check WAV conversion status
   * Endpoint: GET /api/v1/wav/details
   */
  async getWavDetails(taskId: string): Promise<WavConversionDetails> {
    const response = await api.get<SunoApiResponse<WavConversionDetails>>(
      `/api/v1/wav/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get WAV details');
    }
    
    return response.data.data;
  },

  /**
   * Get Vocal Separation Details - Check separation status
   * Endpoint: GET /api/v1/vocal-separation/details
   */
  async getVocalSeparationDetails(taskId: string): Promise<VocalSeparationDetails> {
    const response = await api.get<SunoApiResponse<VocalSeparationDetails>>(
      `/api/v1/vocal-separation/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get vocal separation details');
    }
    
    return response.data.data;
  },

  /**
   * Get Music Video Details - Check video generation status
   * Endpoint: GET /api/v1/music-video/details
   */
  async getMusicVideoDetails(taskId: string): Promise<MusicVideoDetails> {
    const response = await api.get<SunoApiResponse<MusicVideoDetails>>(
      `/api/v1/music-video/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get music video details');
    }
    
    return response.data.data;
  },

  /**
   * Get Cover Details - Check cover generation status
   * Endpoint: GET /api/v1/cover/details
   */
  async getCoverDetails(taskId: string): Promise<CoverDetails> {
    const response = await api.get<SunoApiResponse<CoverDetails>>(
      `/api/v1/cover/details`,
      { params: { taskId } }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get cover details');
    }
    
    return response.data.data;
  },

  /**
   * Get Remaining Credits - Check account credit balance
   * Endpoint: GET /api/v1/credits
   */
  async getRemainingCredits(): Promise<RemainingCreditsResponse> {
    const response = await api.get<SunoApiResponse<RemainingCreditsResponse>>(
      '/api/v1/credits'
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get remaining credits');
    }
    
    return response.data.data;
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Poll Until Complete - Wait for task to finish
   * Generic polling helper for any async task
   */
  async pollUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<MusicGenerationDetails> {
    return pollUntilComplete(
      () => this.getMusicDetails(taskId),
      maxAttempts,
      interval
    );
  },

  /**
   * Poll Lyrics Until Complete
   */
  async pollLyricsUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<LyricsGenerationDetails> {
    return pollUntilComplete(
      () => this.getLyricsDetails(taskId),
      maxAttempts,
      interval
    );
  },

  /**
   * Poll WAV Until Complete
   */
  async pollWavUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<WavConversionDetails> {
    return pollUntilComplete(
      () => this.getWavDetails(taskId),
      maxAttempts,
      interval
    );
  },

  /**
   * Poll Vocal Separation Until Complete
   */
  async pollVocalSeparationUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<VocalSeparationDetails> {
    return pollUntilComplete(
      () => this.getVocalSeparationDetails(taskId),
      maxAttempts,
      interval
    );
  },

  /**
   * Poll Video Until Complete
   */
  async pollVideoUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<MusicVideoDetails> {
    return pollUntilComplete(
      () => this.getMusicVideoDetails(taskId),
      maxAttempts,
      interval
    );
  },

  /**
   * Poll Cover Until Complete
   */
  async pollCoverUntilComplete(
    taskId: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<CoverDetails> {
    return pollUntilComplete(
      () => this.getCoverDetails(taskId),
      maxAttempts,
      interval
    );
  },
};

// Export for backward compatibility with existing code
export default sunoService;
