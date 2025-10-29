import type { ValidationResult, ValidationError } from '../types';
import { openaiService } from './openai';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Normalize text for comparison (lowercase, remove punctuation, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract critical words that need pronunciation validation
 * Focus on proper nouns, place names, and Spanish-specific words
 */
function extractCriticalWords(lyrics: string): string[] {
  const lines = lyrics.split('\n');
  const criticalWords: string[] = [];
  
  for (const line of lines) {
    // Skip annotation lines
    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
      continue;
    }
    
    const words = line.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^\wáéíóúñü]/gi, '');
      
      // Check if it's a critical word (capitalized, has accents, or common mispronunciations)
      if (
        cleanWord.length > 2 &&
        (/^[A-ZÁÉÍÓÚÑÜ]/.test(cleanWord) || // Capitalized
          /[áéíóúñü]/i.test(cleanWord) || // Has accent marks
          isMispronunciationProne(cleanWord))
      ) {
        criticalWords.push(cleanWord);
      }
    }
  }
  
  return [...new Set(criticalWords)]; // Remove duplicates
}

/**
 * Check if a word is prone to mispronunciation by English TTS
 */
function isMispronunciationProne(word: string): boolean {
  const pronePatterns = [
    /méxi/i, // México, mexicano
    /guerre/i, // Guerrero, guerrero
    /juan/i, // Juan, Juana
    /josé/i, // José
    /ll/i, // ll sound (like in villa)
    /ñ/i, // ñ sound
    /rr/i, // rolled r
    /j[aeiou]/i, // j sound (jota)
  ];
  
  return pronePatterns.some(pattern => pattern.test(word));
}

export const validatorService = {
  /**
   * Validate generated audio against ground truth lyrics
   */
  async validateAudio(
    audioUrl: string,
    groundTruthLyrics: string
  ): Promise<ValidationResult> {
    try {
      // Transcribe the audio
      const transcription = await openaiService.transcribeAudio(audioUrl);
      
      // Extract critical words from ground truth
      const criticalWords = extractCriticalWords(groundTruthLyrics);
      
      // Normalize both texts for comparison
      const normalizedGroundTruth = normalizeText(groundTruthLyrics);
      const normalizedTranscription = normalizeText(transcription.text);
      
      // Calculate overall similarity
      const confidence = calculateSimilarity(
        normalizedGroundTruth,
        normalizedTranscription
      );
      
      // Check each critical word
      const errors: ValidationError[] = [];
      
      for (const word of criticalWords) {
        const normalizedWord = normalizeText(word);
        
        // Check if the word appears in transcription with similar spelling
        const wordRegex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
        
        if (!wordRegex.test(normalizedTranscription)) {
          // Word not found - try to find what it became
          const words = normalizedTranscription.split(/\s+/);
          let closestMatch = '';
          let minDistance = Infinity;
          
          for (const transcribedWord of words) {
            const distance = levenshteinDistance(normalizedWord, transcribedWord);
            if (distance < minDistance && distance < normalizedWord.length * 0.5) {
              minDistance = distance;
              closestMatch = transcribedWord;
            }
          }
          
          errors.push({
            word: word,
            expected: word,
            got: closestMatch || '(not found)',
          });
        }
      }
      
      return {
        valid: errors.length === 0 && confidence > 85,
        errors,
        confidence,
        transcription: transcription.text,
      };
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  },

  /**
   * Find the best rollback point (last verse/chorus) before an error
   */
  findRollbackPoint(
    lyrics: string,
    errorPosition?: number
  ): { section: string; line: number; timestamp?: number } {
    const lines = lyrics.split('\n');
    let lastSectionLine = 0;
    let lastSection = 'Intro';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if it's a section marker
      if (line.startsWith('[') && line.endsWith(']')) {
        const section = line.slice(1, -1).toLowerCase();
        
        // Only rollback to verse or chorus sections
        if (section.includes('verse') || section.includes('chorus')) {
          lastSectionLine = i;
          lastSection = section;
        }
        
        // If we're past the error, use the last valid section
        if (errorPosition && i > errorPosition) {
          break;
        }
      }
    }
    
    return {
      section: lastSection,
      line: lastSectionLine,
    };
  },

  /**
   * Extract remaining lyrics from a rollback point
   */
  extractRemainingLyrics(lyrics: string, fromLine: number): string {
    const lines = lyrics.split('\n');
    return lines.slice(fromLine).join('\n');
  },
};
