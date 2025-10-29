import axios from 'axios';
import type { GPTEnhanceResponse, WhisperTranscribeResponse } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GPT_MODEL = import.meta.env.VITE_GPT_MODEL || 'gpt-4-turbo';

export const openaiService = {
  /**
   * Enhance lyrics using GPT with the custom prompt
   */
  async enhanceLyrics(
    rawLyrics: string,
    gptPrompt: string,
    style?: string
  ): Promise<GPTEnhanceResponse> {
    const systemPrompt = gptPrompt;
    const userPrompt = `Estilo musical: ${style || 'corrido'}\n\nLetra original:\n${rawLyrics}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse the two code blocks from the response
    const codeBlocks = content.match(/```([\s\S]*?)```/g);
    
    if (!codeBlocks || codeBlocks.length < 2) {
      throw new Error('Invalid GPT response format');
    }

    // First block: title and description
    const firstBlock = codeBlocks[0].replace(/```/g, '').trim();
    const [title, ...descriptionParts] = firstBlock.split('\n');
    const description = descriptionParts.join('\n').trim();

    // Second block: enhanced lyrics
    const enhancedLyrics = codeBlocks[1].replace(/```/g, '').trim();

    return {
      title: title.trim(),
      description,
      enhancedLyrics,
    };
  },

  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudio(audioUrl: string): Promise<WhisperTranscribeResponse> {
    // First, download the audio file
    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
    });
    
    // Create form data with the audio file
    const formData = new FormData();
    const audioBlob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Spanish
    formData.append('response_format', 'verbose_json'); // Get timestamps

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      text: response.data.text,
      segments: response.data.segments,
    };
  },

  /**
   * Ask GPT to suggest alternative phonetic spelling for a mispronounced word
   */
  async suggestPhoneticFix(
    word: string,
    context: string
  ): Promise<string> {
    const prompt = `El sistema TTS en inglés pronunció incorrectamente la palabra española "${word}" en el contexto: "${context}".

Sugiere una forma alternativa de escribir esta palabra usando técnicas fonéticas para que el TTS en inglés la pronuncie correctamente en español. Por ejemplo:
- "México" → "Méh-hico"
- "Guerrero" → "Gue-rré-ro"
- "juan" → "júúan"

Responde SOLO con la sugerencia fonética, sin explicaciones adicionales.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  },
};
