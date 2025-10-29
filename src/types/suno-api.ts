/**
 * Complete Suno API TypeScript Definitions
 * Based on https://docs.sunoapi.org/
 */

// ============================================================================
// Enums
// ============================================================================

export type SunoModel = 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5';
export type VocalGender = 'm' | 'f';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'error' | 'complete';

// ============================================================================
// Common Request/Response Types
// ============================================================================

export interface SunoApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface TaskIdResponse {
  taskId: string;
}

// ============================================================================
// Music Generation Types
// ============================================================================

export interface GenerateMusicRequest {
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
}

export interface ExtendMusicRequest {
  audioId: string;
  continueAt: number;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export interface UploadAndCoverRequest {
  uploadUrl: string;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
}

export interface UploadAndExtendRequest {
  uploadUrl: string;
  continueAt: number;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export interface AddInstrumentalRequest {
  audioId: string;
  customMode: boolean;
  model: SunoModel;
  callBackUrl: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export interface AddVocalsRequest {
  audioId: string;
  customMode: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export interface CoverMusicRequest {
  audioId: string;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export interface BoostMusicStyleRequest {
  audioId: string;
  model: SunoModel;
  callBackUrl: string;
}

export interface MusicGenerationDetails {
  id: string;
  status: GenerationStatus;
  title?: string;
  lyric?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt?: string;
  modelName?: string;
  duration?: number;
}

// ============================================================================
// Lyrics Types
// ============================================================================

export interface GenerateLyricsRequest {
  prompt: string;
  callBackUrl: string;
}

export interface LyricsGenerationDetails {
  id: string;
  status: GenerationStatus;
  text?: string;
  title?: string;
  createdAt?: string;
}

export interface GetTimestampedLyricsRequest {
  audioId: string;
}

export interface TimestampedLyric {
  start: number;
  end: number;
  text: string;
}

export interface TimestampedLyricsResponse {
  lyrics: TimestampedLyric[];
}

// ============================================================================
// Audio Processing Types
// ============================================================================

export interface SeparateVocalsRequest {
  audioUrl: string;
  model: string;
  callBackUrl: string;
}

export interface VocalSeparationDetails {
  id: string;
  status: GenerationStatus;
  vocalUrl?: string;
  instrumentalUrl?: string;
  createdAt?: string;
}

export interface ConvertToWavRequest {
  audioId: string;
  callBackUrl: string;
}

export interface WavConversionDetails {
  id: string;
  status: GenerationStatus;
  wavUrl?: string;
  createdAt?: string;
}

export interface GeneratePersonaRequest {
  audioId: string;
  callBackUrl: string;
}

export interface PersonaDetails {
  personaId: string;
  audioId: string;
  createdAt?: string;
}

// ============================================================================
// Music Video Types
// ============================================================================

export interface CreateMusicVideoRequest {
  audioId: string;
  imageUrl?: string;
  videoPrompt?: string;
  callBackUrl: string;
}

export interface MusicVideoDetails {
  id: string;
  status: GenerationStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface RemainingCreditsResponse {
  credits: number;
  monthlyLimit?: number;
  usedThisMonth?: number;
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface UploadFileBase64Request {
  name: string;
  data: string;
}

export interface UploadFileUrlRequest {
  url: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
}

// ============================================================================
// Cover Types
// ============================================================================

export interface CoverDetails {
  id: string;
  status: GenerationStatus;
  audioUrl?: string;
  videoUrl?: string;
  title?: string;
  createdAt?: string;
}
