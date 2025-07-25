#!/usr/bin/env node

/**
 * Enhanced Setup Wizard for Qwen Code Internal LLM
 * Uses the new SetupWizard utility for automated configuration
 */

import { SetupWizard } from './packages/core/dist/utils/setupWizard.js';

async function main() {
  console.log('🚀 Qwen Code Enhanced Setup Wizard');
  console.log('=====================================');
  
  const wizard = new SetupWizard({
    interactive: true,
    autoDetect: true,
    skipValidation: false,
  });

  try {
    // Check for existing configurations
    console.log('\n📋 Checking existing configurations...');
    const existing = await wizard.detectExistingConfig();
    
    if (existing.hasLocal) {
      console.log(`📁 Found local config: ${existing.localPath}`);
    }
    
    if (existing.hasGlobal) {
      console.log(`🌐 Found global config: ${existing.globalPath}`);
    }

    // Auto setup with server discovery
    console.log('\n🔍 Starting automatic setup...');
    const result = await wizard.autoSetup({
      scope: 'global',
      defaultApiKey: 'test-key',
      defaultModel: 'internal-llm-model',
    });

    if (result.success) {
      console.log(`\n✅ ${result.message}`);
      
      if (result.recommendations) {
        console.log('\n💡 Recommendations:');
        result.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }

      console.log('\n🎉 Setup completed successfully!');
      console.log('\nNext steps:');
      console.log('  1. Start your internal LLM server');
      console.log('  2. Run: qwen /validate');
      console.log('  3. Start using: qwen');
      
      if (result.configPath) {
        console.log(`\nConfiguration saved to: ${result.configPath}`);
      }

    } else {
      console.log(`\n❌ Setup failed: ${result.message}`);
      
      if (result.errors) {
        console.log('\nErrors:');
        result.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }

      if (result.recommendations) {
        console.log('\nTry these solutions:');
        result.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }

      console.log('\nFalling back to manual setup...');
      await manualSetupFallback();
    }

  } catch (error) {
    console.error('\n💥 Setup wizard failed:', error.message);
    console.log('\nFalling back to manual setup...');
    await manualSetupFallback();
  }
}

async function manualSetupFallback() {
  console.log('\n📝 Manual Setup Instructions');
  console.log('============================');
  
  console.log('\n1. Create configuration file:');
  console.log('   Global: ~/.qwen/.env');
  console.log('   Local: ./.env');
  
  console.log('\n2. Add these variables:');
  console.log('   INTERNAL_LLM_BASE_URL=http://localhost:8443/api/v1');
  console.log('   INTERNAL_LLM_API_KEY=your-api-key');
  console.log('   INTERNAL_LLM_MODEL=your-model-name');
  console.log('   NODE_TLS_REJECT_UNAUTHORIZED=0  # For development only');
  
  console.log('\n3. Test configuration:');
  console.log('   qwen /validate');
  
  console.log('\n4. Start using:');
  console.log('   qwen');
}

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  process.exit(1);
});

// Run the setup wizard
main().catch(error => {
  console.error('\n💥 Setup failed:', error.message);
  process.exit(1);
});