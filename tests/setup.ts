// Test setup file
import { config } from 'dotenv';

// Load environment variables for tests
config();

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests unless verbose
  log: process.env.VERBOSE ? console.log : () => {},
};

// Test helpers
export const TEST_TIMEOUT = 30000; // 30 seconds

export const mockEnv = {
  VITE_SUNO_API_KEY: process.env.VITE_SUNO_API_KEY || 'test-suno-key',
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || 'test-openai-key',
  VITE_SUNO_MODEL_VERSION: 'V5',
  VITE_GPT_MODEL: 'gpt-4o',
};

// Set test env vars
Object.assign(process.env, mockEnv);
