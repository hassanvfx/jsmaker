/**
 * Level 2: Suno API Polling Logic Tests
 * Test status checking and error handling
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock the polling function behavior
type StatusResponse = { status: string; data?: any };

/**
 * Simulated poll function (mimics the actual pollUntilComplete logic)
 */
async function simulatePollUntilComplete(
  getDetailsFn: () => Promise<StatusResponse>,
  maxAttempts = 5,
  interval = 100
): Promise<StatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const details = await getDetailsFn();
    
    // Check for success states (uppercase as per Suno API)
    if (details.status === 'SUCCESS' || 
        details.status === 'FIRST_SUCCESS' ||
        details.status === 'TEXT_SUCCESS') {
      return details;
    }
    
    // Check for error states
    if (details.status === 'CREATE_TASK_FAILED' || 
        details.status === 'GENERATE_AUDIO_FAILED' ||
        details.status === 'CALLBACK_EXCEPTION' ||
        details.status === 'SENSITIVE_WORD_ERROR') {
      throw new Error(`Generation failed with status: ${details.status}`);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Generation timeout after ${maxAttempts} attempts`);
}

describe('Level 2: Suno API Polling Logic', () => {
  
  describe('Success Status Detection', () => {
    test('should return immediately on SUCCESS status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'SUCCESS',
        data: { audioUrl: 'https://example.com/audio.mp3' }
      });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(1); // Should not poll again
    });

    test('should return immediately on FIRST_SUCCESS status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'FIRST_SUCCESS',
        data: { audioUrl: 'https://example.com/audio.mp3' }
      });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('FIRST_SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should return immediately on TEXT_SUCCESS status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'TEXT_SUCCESS',
        data: { lyrics: 'Generated lyrics' }
      });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('TEXT_SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Status Detection', () => {
    test('should throw error on CREATE_TASK_FAILED', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'CREATE_TASK_FAILED'
      });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('Generation failed with status: CREATE_TASK_FAILED');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should throw error on GENERATE_AUDIO_FAILED', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'GENERATE_AUDIO_FAILED'
      });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('Generation failed with status: GENERATE_AUDIO_FAILED');
    });

    test('should throw error on CALLBACK_EXCEPTION', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'CALLBACK_EXCEPTION'
      });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('Generation failed with status: CALLBACK_EXCEPTION');
    });

    test('should throw error on SENSITIVE_WORD_ERROR', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'SENSITIVE_WORD_ERROR'
      });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('Generation failed with status: SENSITIVE_WORD_ERROR');
    });
  });

  describe('Polling Behavior', () => {
    test('should poll multiple times until SUCCESS', async () => {
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'SUCCESS', data: { audioUrl: 'done' } });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test('should timeout after max attempts', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'PENDING' });

      await expect(simulatePollUntilComplete(mockFn, 3, 10))
        .rejects
        .toThrow('Generation timeout after 3 attempts');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test('should handle PENDING → FIRST_SUCCESS transition', async () => {
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'FIRST_SUCCESS', data: { track1: 'done' } });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('FIRST_SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('should handle PENDING → ERROR transition', async () => {
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'GENERATE_AUDIO_FAILED' });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('Generation failed with status: GENERATE_AUDIO_FAILED');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Status Case Sensitivity', () => {
    test('should NOT match lowercase "success"', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'success' });

      // Should timeout because lowercase doesn't match
      await expect(simulatePollUntilComplete(mockFn, 2, 10))
        .rejects
        .toThrow('Generation timeout after 2 attempts');
    });

    test('should NOT match lowercase "pending"', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'pending' });

      // Should timeout because lowercase doesn't match
      await expect(simulatePollUntilComplete(mockFn, 2, 10))
        .rejects
        .toThrow('Generation timeout after 2 attempts');
    });

    test('should ONLY match exact uppercase SUCCESS', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'SUCCESS' });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('Real-World Scenarios', () => {
    test('should handle your actual API response (SUCCESS)', async () => {
      // This is the exact response structure you showed
      const mockFn = jest.fn().mockResolvedValue({
        status: 'SUCCESS',
        taskId: 'a0f605874030915037c89e3730b20fbf',
        response: {
          sunoData: [
            {
              id: '8a346c15-6871-43b3-b82e-1ff0b10cf552',
              audioUrl: 'https://musicfile.api.box/OGEzNDZjMTUtNjg3MS00M2IzLWI4MmUtMWZmMGIxMGNmNTUy.mp3',
              title: 'New Corrido Project',
              duration: 44.92
            }
          ]
        }
      });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('SUCCESS');
      expect(result.response.sunoData).toHaveLength(1);
      expect(result.response.sunoData[0].title).toBe('New Corrido Project');
    });

    test('should handle realistic polling sequence', async () => {
      // Simulates: PENDING → PENDING → FIRST_SUCCESS → SUCCESS
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ 
          status: 'FIRST_SUCCESS', 
          response: { sunoData: [{ id: '1', audioUrl: 'track1.mp3' }] }
        });

      const result = await simulatePollUntilComplete(mockFn, 5, 10);
      
      expect(result.status).toBe('FIRST_SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test('should handle immediate success (fast generation)', async () => {
      const mockFn = jest.fn().mockResolvedValue({ 
        status: 'SUCCESS',
        response: { sunoData: [{ audioUrl: 'fast.mp3' }] }
      });

      const startTime = Date.now();
      const result = await simulatePollUntilComplete(mockFn, 5, 100);
      const elapsed = Date.now() - startTime;
      
      expect(result.status).toBe('SUCCESS');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(elapsed).toBeLessThan(50); // Should be instant, no polling
    });

    test('should handle generation failure after pending', async () => {
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'SENSITIVE_WORD_ERROR' });

      await expect(simulatePollUntilComplete(mockFn, 5, 10))
        .rejects
        .toThrow('SENSITIVE_WORD_ERROR');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: '' });

      await expect(simulatePollUntilComplete(mockFn, 2, 10))
        .rejects
        .toThrow('timeout');
    });

    test('should handle undefined status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: undefined as any });

      await expect(simulatePollUntilComplete(mockFn, 2, 10))
        .rejects
        .toThrow('timeout');
    });

    test('should handle mixed case status', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'Success' });

      // Should not match mixed case
      await expect(simulatePollUntilComplete(mockFn, 2, 10))
        .rejects
        .toThrow('timeout');
    });

    test('should respect maxAttempts parameter', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'PENDING' });

      await expect(simulatePollUntilComplete(mockFn, 10, 10))
        .rejects
        .toThrow('timeout after 10 attempts');
      
      expect(mockFn).toHaveBeenCalledTimes(10);
    });
  });

  describe('Performance', () => {
    test('should poll at correct interval', async () => {
      const mockFn = jest.fn()
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'SUCCESS' });

      const startTime = Date.now();
      await simulatePollUntilComplete(mockFn, 5, 50);
      const elapsed = Date.now() - startTime;
      
      // Should take ~100ms (2 polls at 50ms interval)
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(200);
    });

    test('should not delay on immediate success', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'SUCCESS' });

      const startTime = Date.now();
      await simulatePollUntilComplete(mockFn, 5, 100);
      const elapsed = Date.now() - startTime;
      
      // Should be instant (< 50ms)
      expect(elapsed).toBeLessThan(50);
    });
  });
});
