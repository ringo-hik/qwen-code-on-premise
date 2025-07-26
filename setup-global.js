#!/usr/bin/env node

/**
 * Global setup script for Qwen Code
 * Copies .env configuration to user's home directory for global access
 */

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const USER_SETTINGS_DIR = path.join(homedir(), '.qwen');
const globalEnvPath = path.join(USER_SETTINGS_DIR, '.env');
const localEnvPath = path.join(process.cwd(), '.env');

console.log('🚀 Setting up Qwen Code for global usage...');

// Create .qwen directory if it doesn't exist
if (!fs.existsSync(USER_SETTINGS_DIR)) {
  fs.mkdirSync(USER_SETTINGS_DIR, { recursive: true });
  console.log(`✅ Created directory: ${USER_SETTINGS_DIR}`);
}

// Copy .env file to global location if it exists locally
if (fs.existsSync(localEnvPath)) {
  fs.copyFileSync(localEnvPath, globalEnvPath);
  console.log(`✅ Copied .env to global location: ${globalEnvPath}`);
} else {
  // Create default .env file
  const defaultEnv = `# Qwen Code OpenRouter 설정

# ===========================================
# OpenRouter API 설정 (필수) 
# ===========================================
OPENAI_API_KEY=your-openrouter-api-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3.5-sonnet
`;
  
  fs.writeFileSync(globalEnvPath, defaultEnv);
  console.log(`✅ Created default .env file: ${globalEnvPath}`);
  console.log('⚠️  Please edit the .env file and set your OpenRouter API key');
}

console.log('\n🎉 Global setup complete!');
console.log('\nNext steps:');
console.log(`1. Edit ${globalEnvPath}`);
console.log('2. Set your OpenRouter API key in OPENAI_API_KEY');
console.log('3. Run "qwen" command from anywhere');
console.log('\nExample usage:');
console.log('  qwen "Hello world"');
console.log('  echo "Explain this code" | qwen');