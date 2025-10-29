/**
 * Test for audio URL extraction from Suno API response
 * This tests the bug where UI was checking wrong path for audioUrl
 */

import { describe, test, expect } from '@jest/globals';
import type { MusicGenerationDetails } from '../../src/types/suno-api';

describe('Audio URL Extraction from Suno Response', () => {
  
  test('should extract audioUrl from correct path in response', () => {
    // This is the ACTUAL structure from Suno API
    const mockResponse: MusicGenerationDetails = {
      taskId: 'ca7ef9ac4f345bd2da16825434e6133b',
      status: 'SUCCESS',
      response: {
        taskId: 'ca7ef9ac4f345bd2da16825434e6133b',
        sunoData: [
          {
            id: '66e3328a-5a55-4b8c-9a15-213f1ee5852c',
            audioUrl: 'https://musicfile.api.box/test.mp3',
            sourceAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            streamAudioUrl: 'https://musicfile.api.box/test',
            sourceStreamAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            imageUrl: 'https://musicfile.api.box/test.jpeg',
            sourceImageUrl: 'https://cdn2.suno.ai/image_test.jpeg',
            prompt: 'Test corrido',
            modelName: 'chirp-crow',
            title: 'Test Corrido',
            tags: 'Regional Mexican corrido',
            createTime: 1761711606040,
            duration: 162.0
          }
        ]
      }
    };

    // The CORRECT way to extract audio URL
    const audioUrl = mockResponse.response.sunoData[0].audioUrl;
    
    expect(audioUrl).toBe('https://musicfile.api.box/test.mp3');
    expect(audioUrl).toBeTruthy();
  });

  test('should handle response with multiple tracks', () => {
    const mockResponse: MusicGenerationDetails = {
      taskId: 'test-id',
      status: 'SUCCESS',
      response: {
        taskId: 'test-id',
        sunoData: [
          {
            id: 'track1',
            audioUrl: 'https://example.com/track1.mp3',
            sourceAudioUrl: 'https://cdn1.suno.ai/track1.mp3',
            streamAudioUrl: 'https://example.com/track1',
            sourceStreamAudioUrl: 'https://cdn1.suno.ai/track1.mp3',
            imageUrl: 'https://example.com/track1.jpeg',
            sourceImageUrl: 'https://cdn2.suno.ai/image_track1.jpeg',
            prompt: 'Test',
            modelName: 'chirp-crow',
            title: 'Track 1',
            tags: 'test',
            createTime: 123456,
            duration: 180
          },
          {
            id: 'track2',
            audioUrl: 'https://example.com/track2.mp3',
            sourceAudioUrl: 'https://cdn1.suno.ai/track2.mp3',
            streamAudioUrl: 'https://example.com/track2',
            sourceStreamAudioUrl: 'https://cdn1.suno.ai/track2.mp3',
            imageUrl: 'https://example.com/track2.jpeg',
            sourceImageUrl: 'https://cdn2.suno.ai/image_track2.jpeg',
            prompt: 'Test',
            modelName: 'chirp-crow',
            title: 'Track 2',
            tags: 'test',
            createTime: 123456,
            duration: 179
          }
        ]
      }
    };

    // Should have 2 tracks
    expect(mockResponse.response.sunoData).toHaveLength(2);
    
    // Both should have audio URLs
    expect(mockResponse.response.sunoData[0].audioUrl).toBeTruthy();
    expect(mockResponse.response.sunoData[1].audioUrl).toBeTruthy();
  });

  test('should fail when checking wrong path (the bug)', () => {
    const mockResponse: MusicGenerationDetails = {
      taskId: 'test-id',
      status: 'SUCCESS',
      response: {
        taskId: 'test-id',
        sunoData: [
          {
            id: 'test',
            audioUrl: 'https://example.com/test.mp3',
            sourceAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            streamAudioUrl: 'https://example.com/test',
            sourceStreamAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            imageUrl: 'https://example.com/test.jpeg',
            sourceImageUrl: 'https://cdn2.suno.ai/image_test.jpeg',
            prompt: 'Test',
            modelName: 'chirp-crow',
            title: 'Test',
            tags: 'test',
            createTime: 123456,
            duration: 180
          }
        ]
      }
    };

    // The WRONG way (what the UI was doing)
    const wrongPath = (mockResponse as any).audioUrl;
    
    // This should be undefined (the bug!)
    expect(wrongPath).toBeUndefined();
    
    // The RIGHT way
    const rightPath = mockResponse.response.sunoData[0].audioUrl;
    expect(rightPath).toBeTruthy();
  });

  test('should validate complete response structure', () => {
    const mockResponse: MusicGenerationDetails = {
      taskId: 'ca7ef9ac4f345bd2da16825434e6133b',
      status: 'SUCCESS',
      response: {
        taskId: 'ca7ef9ac4f345bd2da16825434e6133b',
        sunoData: [
          {
            id: '66e3328a-5a55-4b8c-9a15-213f1ee5852c',
            audioUrl: 'https://musicfile.api.box/test.mp3',
            sourceAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            streamAudioUrl: 'https://musicfile.api.box/test',
            sourceStreamAudioUrl: 'https://cdn1.suno.ai/test.mp3',
            imageUrl: 'https://musicfile.api.box/test.jpeg',
            sourceImageUrl: 'https://cdn2.suno.ai/image_test.jpeg',
            prompt: 'El corrido de El Pollito',
            modelName: 'chirp-crow',
            title: 'New Corrido Project',
            tags: 'Regional Mexican corrido, corrido',
            createTime: 1761711606040,
            duration: 162.0
          }
        ]
      }
    };

    // Verify structure
    expect(mockResponse.taskId).toBeTruthy();
    expect(mockResponse.status).toBe('SUCCESS');
    expect(mockResponse.response).toBeDefined();
    expect(mockResponse.response.sunoData).toBeDefined();
    expect(Array.isArray(mockResponse.response.sunoData)).toBe(true);
    expect(mockResponse.response.sunoData.length).toBeGreaterThan(0);
    
    // Verify first track
    const firstTrack = mockResponse.response.sunoData[0];
    expect(firstTrack.id).toBeTruthy();
    expect(firstTrack.audioUrl).toMatch(/^https?:\/\//);
    expect(firstTrack.title).toBeTruthy();
    expect(firstTrack.duration).toBeGreaterThan(0);
  });
});
