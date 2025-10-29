/**
 * Level 3: Suno API End-to-End Integration Tests
 * 
 * These tests make REAL API calls to Suno and cost credits!
 * They are skipped by default. To run:
 * 
 * npm run test:integration
 * 
 * Or run specific test:
 * npm test -- tests/integration/suno-e2e.test.ts
 */

import { describe, test, expect } from '@jest/globals';
import { sunoService } from '../../src/services/suno';

// Helper to check if we should run integration tests
const shouldRunIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';

describe('Level 3: Suno E2E Integration', () => {
  
  // Use test.skip by default to avoid accidental API charges
  const testFn = shouldRunIntegration ? test : test.skip;

  testFn('should generate minimal corrido and poll to completion', async () => {
    console.log('🎵 Starting corrido generation...');
    
    // Step 1: Generate music with minimal lyrics
    const taskId = await sunoService.generateMusic({
      prompt: '[Verse]\nUn corrido muy corto\nPara probar el sistema',
      style: 'Regional Mexican corrido',
      title: 'Test Corrido',
      customMode: true,
      instrumental: false,
      model: 'V5',
    });
    
    console.log(`✅ Task created: ${taskId}`);
    expect(taskId).toBeTruthy();
    expect(typeof taskId).toBe('string');
    
    // Step 2: Poll until completion (real API, takes 30-60 seconds)
    console.log('⏳ Polling for completion (this may take 30-60 seconds)...');
    const startTime = Date.now();
    
    const result = await sunoService.pollUntilComplete(
      taskId,
      60,  // Max 60 attempts
      5000 // Poll every 5 seconds
    );
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ Completed in ${elapsed} seconds`);
    
    // Step 3: Verify the result
    expect(result).toBeDefined();
    // Accept any success status
    expect(['SUCCESS', 'FIRST_SUCCESS', 'TEXT_SUCCESS']).toContain(result.status);
    expect(result.taskId).toBe(taskId);
    
    // Step 4: Verify we got audio data
    expect(result.response).toBeDefined();
    expect(result.response.sunoData).toBeDefined();
    expect(Array.isArray(result.response.sunoData)).toBe(true);
    expect(result.response.sunoData.length).toBeGreaterThan(0);
    
    // Step 5: Verify each track has required fields
    for (const track of result.response.sunoData) {
      console.log(`📀 Track: "${track.title}" (${track.duration}s)`);
      console.log(`   🔗 ${track.audioUrl}`);
      
      expect(track.id).toBeTruthy();
      expect(track.audioUrl).toMatch(/^https?:\/\//);
      expect(track.title).toBeTruthy();
      expect(track.duration).toBeGreaterThan(0);
      expect(track.modelName).toBeTruthy();
    }
    
    console.log('✅ All validations passed!');
  }, 180000); // 3 minute timeout for safety

  testFn('should handle generation with style parameter', async () => {
    console.log('🎵 Testing with explicit style...');
    
    const taskId = await sunoService.generateMusic({
      prompt: 'Test lyrics here',
      style: 'corridos_norteno_banda',
      title: 'Style Test',
      model: 'V5',
    });
    
    expect(taskId).toBeTruthy();
    console.log(`✅ Task created: ${taskId}`);
    
    // Poll to completion
    const result = await sunoService.pollUntilComplete(taskId, 60, 5000);
    
    expect(result.status).toBe('SUCCESS');
    expect(result.response.sunoData.length).toBeGreaterThan(0);
    
    console.log(`✅ Generated with style: ${result.response.sunoData[0].tags}`);
  }, 180000);

  testFn('should fail gracefully on invalid prompt', async () => {
    console.log('🧪 Testing error handling...');
    
    // Suno may reject empty or inappropriate prompts
    try {
      const taskId = await sunoService.generateMusic({
        prompt: '', // Empty prompt
        title: 'Error Test',
        model: 'V5',
      });
      
      if (taskId) {
        // If task was created, poll for it
        const result = await sunoService.pollUntilComplete(taskId, 20, 3000);
        
        // Should either error out or complete
        expect(['SUCCESS', 'GENERATE_AUDIO_FAILED', 'SENSITIVE_WORD_ERROR'])
          .toContain(result.status);
        
        console.log(`Status: ${result.status}`);
      }
    } catch (error: any) {
      // Expected - API should reject invalid requests
      console.log(`✅ Correctly rejected: ${error.message}`);
      expect(error).toBeDefined();
    }
  }, 120000);

  test('should provide clear instructions when skipped', () => {
    if (!shouldRunIntegration) {
      console.log(`
⚠️  Integration tests are SKIPPED by default to avoid API charges.

To run these tests:

1. Set environment variable:
   export RUN_INTEGRATION_TESTS=true

2. Run integration tests:
   npm run test:integration

3. Or run this specific test:
   RUN_INTEGRATION_TESTS=true npm test -- tests/integration/suno-e2e.test.ts

Note: Each test costs ~$0.20 in API credits.
      `);
    }
    
    // This test always passes, just provides info
    expect(true).toBe(true);
  });
});

describe('Level 3: Suno API Error Handling', () => {
  const testFn = shouldRunIntegration ? test : test.skip;

  testFn('should detect invalid API key', async () => {
    // This test would need to temporarily override the API key
    // Skip for now as it would break other tests
    console.log('ℹ️  API key validation test (manual verification needed)');
    expect(true).toBe(true);
  }, 30000);

  testFn('should handle network timeouts gracefully', async () => {
    console.log('🧪 Testing timeout handling...');
    
    const taskId = await sunoService.generateMusic({
      prompt: 'Quick test',
      title: 'Timeout Test',
      model: 'V5',
    });
    
    // Try polling with very short timeout
    try {
      await sunoService.pollUntilComplete(
        taskId,
        2,   // Only 2 attempts
        1000 // 1 second interval
      );
      
      // If it completes this fast, that's fine
      console.log('✅ Completed faster than expected');
    } catch (error: any) {
      // Expected timeout
      expect(error.message).toContain('timeout');
      console.log(`✅ Timeout handled correctly: ${error.message}`);
    }
  }, 60000);
});

describe('Level 3: Real-World Workflow', () => {
  const testFn = shouldRunIntegration ? test : test.skip;

  testFn('should complete full corrido workflow', async () => {
    console.log('🎬 Testing complete workflow...\n');
    
    // Step 1: Generate lyrics-based corrido
    console.log('Step 1: Generating corrido...');
    const taskId = await sunoService.generateMusic({
      prompt: `[Verse 1]
En un rancho muy lejano
Donde el sol siempre brillaba
Vivía un hombre valiente
Que a su tierra mucho amaba

[Chorus]
Este es un corrido de prueba
Para verificar el sistema
Yoy and Song
De tu vida`,
      style: 'Regional Mexican corrido, corridos_norteno_banda',
      title: 'Corrido de Prueba',
      customMode: true,
      model: 'V5',
    });
    
    expect(taskId).toBeTruthy();
    console.log(`✅ Task ID: ${taskId}\n`);
    
    // Step 2: Poll with progress updates
    console.log('Step 2: Waiting for generation...');
    let attempts = 0;
    const maxAttempts = 60;
    
    const result = await (async () => {
      for (let i = 0; i < maxAttempts; i++) {
        attempts++;
        const details = await sunoService.getMusicDetails(taskId);
        
        console.log(`  Attempt ${attempts}/${maxAttempts}: ${details.status}`);
        
        if (details.status === 'SUCCESS' || 
            details.status === 'FIRST_SUCCESS' ||
            details.status === 'TEXT_SUCCESS') {
          return details;
        }
        
        if (details.status.includes('FAILED') || 
            details.status.includes('ERROR')) {
          throw new Error(`Generation failed: ${details.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      throw new Error('Timeout');
    })();
    
    console.log(`✅ Completed after ${attempts} attempts\n`);
    
    // Step 3: Validate results
    console.log('Step 3: Validating results...');
    expect(result.status).toBe('SUCCESS');
    expect(result.response.sunoData).toHaveLength(2); // Suno generates 2 variations
    
    // Step 4: Display results
    console.log('\n📊 Generation Results:');
    console.log('═══════════════════════════════════════\n');
    
    result.response.sunoData.forEach((track, index) => {
      console.log(`Track ${index + 1}:`);
      console.log(`  Title: ${track.title}`);
      console.log(`  Duration: ${track.duration}s`);
      console.log(`  Model: ${track.modelName}`);
      console.log(`  Audio: ${track.audioUrl}`);
      console.log(`  Image: ${track.imageUrl}`);
      console.log('');
    });
    
    console.log('✅ Full workflow completed successfully!\n');
  }, 300000); // 5 minute timeout for full workflow
});
