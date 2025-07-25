#!/usr/bin/env node

/**
 * Model Manager CLI Tool for Qwen Code
 * Comprehensive multi-LLM model management system
 */

import { ModelManager } from './packages/core/dist/src/utils/modelManager.js';
import { ModelSelectionService } from './packages/core/dist/src/services/modelSelectionService.js';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

// CLI 색상 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

// 명령어 파싱
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log(colorize('🤖 Qwen Code Model Manager', 'cyan'));
  console.log(colorize('═'.repeat(35), 'gray'));
  console.log();

  try {
    // 가상의 Config 객체 생성 (실제로는 앱에서 제공됨)
    const configDir = path.join(homedir(), '.qwen');
    const mockConfig = {
      getModel: () => 'qwen3-coder-max',
      setModel: (model) => console.log(`Model set to: ${model}`)
    };

    const modelManager = new ModelManager({ configDir });
    await modelManager.loadConfig();

    switch (command) {
      case 'list':
      case 'ls':
        await listServers(modelManager);
        break;

      case 'add':
        await addServer(modelManager, args.slice(1));
        break;

      case 'remove':
      case 'rm':
        await removeServer(modelManager, args.slice(1));
        break;

      case 'health':
      case 'status':
        await checkHealth(modelManager);
        break;

      case 'test':
        await testServer(modelManager, args.slice(1));
        break;

      case 'select':
        await selectOptimalServer(modelManager);
        break;

      case 'config':
        await showConfig(modelManager);
        break;

      case 'validate':
        await validateAllServers(modelManager);
        break;

      case 'discover':
        await discoverServers(modelManager);
        break;

      case 'priority':
        await setPriority(modelManager, args.slice(1));
        break;

      case 'activate':
      case 'enable':
        await toggleServer(modelManager, args.slice(1), true);
        break;

      case 'deactivate':
      case 'disable':
        await toggleServer(modelManager, args.slice(1), false);
        break;

      case 'stats':
        await showStats(modelManager);
        break;

      case 'help':
      case undefined:
        showHelp();
        break;

      default:
        console.log(colorize(`❌ Unknown command: ${command}`, 'red'));
        console.log(colorize('Run "node model-manager.js help" for usage information', 'gray'));
        process.exit(1);
    }

  } catch (error) {
    console.error(colorize('💥 Error:', 'red'), error.message);
    process.exit(1);
  }
}

async function listServers(modelManager) {
  const servers = modelManager.getServers();
  
  if (servers.length === 0) {
    console.log(colorize('📭 No model servers configured', 'yellow'));
    return;
  }

  console.log(colorize('📋 Configured Model Servers:', 'bright'));
  console.log();

  for (const server of servers) {
    const status = modelManager.getServerStatus(server.id);
    const statusIcon = server.isActive 
      ? (status?.isHealthy ? '✅' : '❌') 
      : '⚫';
    
    console.log(`${statusIcon} ${colorize(server.name, 'bright')} ${colorize(`(${server.id})`, 'gray')}`);
    console.log(`   ${colorize('URL:', 'gray')} ${server.baseUrl}`);
    console.log(`   ${colorize('Model:', 'gray')} ${server.model}`);
    console.log(`   ${colorize('Priority:', 'gray')} ${server.priority}`);
    
    if (server.capabilities) {
      console.log(`   ${colorize('Capabilities:', 'gray')} ${server.capabilities.join(', ')}`);
    }
    
    if (status) {
      const responseTime = status.responseTime > 0 ? `${status.responseTime}ms` : 'N/A';
      console.log(`   ${colorize('Status:', 'gray')} ${status.isHealthy ? 'Healthy' : 'Unhealthy'} (${responseTime})`);
    }
    
    console.log();
  }
}

async function addServer(modelManager, args) {
  if (args.length < 3) {
    console.log(colorize('❌ Usage: add <id> <url> <model> [priority]', 'red'));
    return;
  }

  const [id, url, model, priorityStr] = args;
  const priority = priorityStr ? parseInt(priorityStr) : 50;

  const server = {
    id,
    name: `Server ${id}`,
    baseUrl: url,
    model,
    priority,
    isActive: true,
    capabilities: ['chat', 'completion'],
    description: 'Manually added server'
  };

  modelManager.addServer(server);
  await modelManager.saveConfig();
  
  console.log(colorize(`✅ Added server: ${id}`, 'green'));
  
  // 즉시 상태 확인
  console.log(colorize('🔍 Testing server connection...', 'blue'));
  await modelManager.checkServerHealth(id);
  
  const status = modelManager.getServerStatus(id);
  if (status?.isHealthy) {
    console.log(colorize(`✅ Server is healthy (${status.responseTime}ms)`, 'green'));
  } else {
    console.log(colorize(`❌ Server is not responding: ${status?.error || 'Unknown error'}`, 'red'));
  }
}

async function removeServer(modelManager, args) {
  if (args.length < 1) {
    console.log(colorize('❌ Usage: remove <id>', 'red'));
    return;
  }

  const [id] = args;
  const removed = modelManager.removeServer(id);
  
  if (removed) {
    await modelManager.saveConfig();
    console.log(colorize(`✅ Removed server: ${id}`, 'green'));
  } else {
    console.log(colorize(`❌ Server not found: ${id}`, 'red'));
  }
}

async function checkHealth(modelManager) {
  console.log(colorize('🔍 Checking server health...', 'blue'));
  console.log();

  const servers = modelManager.getActiveServers();
  if (servers.length === 0) {
    console.log(colorize('📭 No active servers to check', 'yellow'));
    return;
  }

  for (const server of servers) {
    process.stdout.write(`  Testing ${server.name}... `);
    
    const status = await modelManager.checkServerHealth(server.id);
    
    if (status.isHealthy) {
      console.log(colorize(`✅ OK (${status.responseTime}ms)`, 'green'));
    } else {
      console.log(colorize(`❌ FAILED${status.error ? ` (${status.error})` : ''}`, 'red'));
    }
  }

  console.log();
  const stats = modelManager.getStats();
  console.log(colorize(`📊 Summary: ${stats.healthyServers}/${stats.activeServers} servers healthy`, 'cyan'));
}

async function testServer(modelManager, args) {
  if (args.length < 1) {
    console.log(colorize('❌ Usage: test <server-id>', 'red'));
    return;
  }

  const [serverId] = args;
  const server = modelManager.getServers().find(s => s.id === serverId);
  
  if (!server) {
    console.log(colorize(`❌ Server not found: ${serverId}`, 'red'));
    return;
  }

  console.log(colorize(`🔍 Testing server: ${server.name}`, 'blue'));
  console.log();

  const status = await modelManager.checkServerHealth(serverId);
  
  console.log(`${colorize('Server ID:', 'gray')} ${server.id}`);
  console.log(`${colorize('Name:', 'gray')} ${server.name}`);
  console.log(`${colorize('URL:', 'gray')} ${server.baseUrl}`);
  console.log(`${colorize('Model:', 'gray')} ${server.model}`);
  console.log(`${colorize('Active:', 'gray')} ${server.isActive ? 'Yes' : 'No'}`);
  console.log();

  if (status.isHealthy) {
    console.log(colorize('✅ Server is healthy', 'green'));
    console.log(`${colorize('Response Time:', 'gray')} ${status.responseTime}ms`);
  } else {
    console.log(colorize('❌ Server is unhealthy', 'red'));
    if (status.error) {
      console.log(`${colorize('Error:', 'gray')} ${status.error}`);
    }
  }
}

async function selectOptimalServer(modelManager) {
  console.log(colorize('🎯 Selecting optimal server...', 'blue'));
  
  const bestServer = modelManager.selectBestServer({
    capability: 'chat'
  });

  if (bestServer) {
    console.log(colorize(`✅ Selected: ${bestServer.name}`, 'green'));
    console.log(`   ${colorize('URL:', 'gray')} ${bestServer.baseUrl}`);
    console.log(`   ${colorize('Model:', 'gray')} ${bestServer.model}`);
    console.log(`   ${colorize('Priority:', 'gray')} ${bestServer.priority}`);
    
    const status = modelManager.getServerStatus(bestServer.id);
    if (status) {
      console.log(`   ${colorize('Response Time:', 'gray')} ${status.responseTime}ms`);
    }
  } else {
    console.log(colorize('❌ No healthy servers available', 'red'));
  }
}

async function showConfig(modelManager) {
  const configPath = path.join(homedir(), '.qwen', 'models.json');
  
  console.log(colorize(`📄 Configuration file: ${configPath}`, 'blue'));
  console.log();

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.log(colorize('❌ Failed to read configuration file', 'red'));
    }
  } else {
    console.log(colorize('📭 Configuration file not found', 'yellow'));
  }
}

async function validateAllServers(modelManager) {
  console.log(colorize('🔍 Comprehensive server validation...', 'blue'));
  console.log();

  const servers = modelManager.getServers();
  let healthyCount = 0;
  let totalCount = servers.length;

  for (const server of servers) {
    console.log(colorize(`Testing ${server.name}:`, 'bright'));
    
    // 기본 연결 테스트
    const status = await modelManager.checkServerHealth(server.id);
    
    if (status.isHealthy) {
      console.log(`  ✅ Connection: ${colorize('OK', 'green')} (${status.responseTime}ms)`);
      console.log(`  ✅ Model: ${colorize(server.model, 'green')}`);
      console.log(`  ✅ Capabilities: ${colorize(server.capabilities?.join(', ') || 'Unknown', 'green')}`);
      healthyCount++;
    } else {
      console.log(`  ❌ Connection: ${colorize('FAILED', 'red')}`);
      if (status.error) {
        console.log(`     ${colorize('Error:', 'gray')} ${status.error}`);
      }
    }
    
    console.log();
  }

  console.log(colorize('📊 Validation Summary:', 'cyan'));
  console.log(`   ${colorize('Total servers:', 'gray')} ${totalCount}`);
  console.log(`   ${colorize('Healthy servers:', 'gray')} ${healthyCount}`);
  console.log(`   ${colorize('Success rate:', 'gray')} ${totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0}%`);

  if (healthyCount === 0 && totalCount > 0) {
    console.log();
    console.log(colorize('⚠️  Troubleshooting suggestions:', 'yellow'));
    console.log('   • Check if your internal LLM servers are running');
    console.log('   • Verify network connectivity');
    console.log('   • Check API keys and authentication');
    console.log('   • Review server configuration');
  }
}

async function discoverServers(modelManager) {
  console.log(colorize('🔍 Discovering internal LLM servers...', 'blue'));
  
  const candidateUrls = [
    'http://localhost:8443/devport/api/v1',
    'http://localhost:8443/api/v1',
    'http://localhost:8080/api/v1',
    'http://localhost:3000/api/v1',
    'http://127.0.0.1:8443/api/v1',
  ];

  let foundCount = 0;

  for (const url of candidateUrls) {
    process.stdout.write(`  Testing ${url}... `);
    
    // 임시 서버 구성으로 테스트
    const tempId = `temp-${Date.now()}`;
    const tempServer = {
      id: tempId,
      name: `Discovered Server`,
      baseUrl: url,
      model: 'auto-detected',
      priority: 99,
      isActive: true,
      capabilities: ['chat', 'completion']
    };

    modelManager.addServer(tempServer);
    const status = await modelManager.checkServerHealth(tempId);
    modelManager.removeServer(tempId);

    if (status.isHealthy) {
      console.log(colorize(`✅ Found (${status.responseTime}ms)`, 'green'));
      
      // 실제 서버로 추가
      const serverId = `discovered-${foundCount + 1}`;
      const realServer = {
        id: serverId,
        name: `Discovered Server ${foundCount + 1}`,
        baseUrl: url,
        model: 'internal-llm-model',
        priority: 50 + foundCount,
        isActive: true,
        capabilities: ['chat', 'completion'],
        description: 'Automatically discovered server'
      };
      
      modelManager.addServer(realServer);
      foundCount++;
    } else {
      console.log(colorize('❌ Not found', 'gray'));
    }
  }

  if (foundCount > 0) {
    await modelManager.saveConfig();
    console.log();
    console.log(colorize(`✅ Discovered ${foundCount} server(s)`, 'green'));
  } else {
    console.log();
    console.log(colorize('📭 No servers found automatically', 'yellow'));
  }
}

async function setPriority(modelManager, args) {
  if (args.length < 2) {
    console.log(colorize('❌ Usage: priority <server-id> <priority-number>', 'red'));
    return;
  }

  const [serverId, priorityStr] = args;
  const priority = parseInt(priorityStr);

  if (isNaN(priority)) {
    console.log(colorize('❌ Priority must be a number', 'red'));
    return;
  }

  const success = modelManager.setServerPriority(serverId, priority);
  
  if (success) {
    await modelManager.saveConfig();
    console.log(colorize(`✅ Set priority for ${serverId} to ${priority}`, 'green'));
  } else {
    console.log(colorize(`❌ Server not found: ${serverId}`, 'red'));
  }
}

async function toggleServer(modelManager, args, isActive) {
  if (args.length < 1) {
    console.log(colorize(`❌ Usage: ${isActive ? 'activate' : 'deactivate'} <server-id>`, 'red'));
    return;
  }

  const [serverId] = args;
  const success = modelManager.setServerActive(serverId, isActive);
  
  if (success) {
    await modelManager.saveConfig();
    console.log(colorize(`✅ ${isActive ? 'Activated' : 'Deactivated'} server: ${serverId}`, 'green'));
  } else {
    console.log(colorize(`❌ Server not found: ${serverId}`, 'red'));
  }
}

async function showStats(modelManager) {
  const stats = modelManager.getStats();
  
  console.log(colorize('📊 Model Manager Statistics', 'cyan'));
  console.log();
  console.log(`${colorize('Total Servers:', 'gray')} ${stats.totalServers}`);
  console.log(`${colorize('Active Servers:', 'gray')} ${stats.activeServers}`);
  console.log(`${colorize('Healthy Servers:', 'gray')} ${stats.healthyServers}`);
  console.log(`${colorize('Average Response Time:', 'gray')} ${stats.avgResponseTime}ms`);
  
  const healthRate = stats.activeServers > 0 ? Math.round((stats.healthyServers / stats.activeServers) * 100) : 0;
  console.log(`${colorize('Health Rate:', 'gray')} ${healthRate}%`);
}

function showHelp() {
  console.log(colorize('📚 Qwen Code Model Manager Commands', 'cyan'));
  console.log();
  console.log(colorize('Server Management:', 'bright'));
  console.log('  list, ls                     List all configured servers');
  console.log('  add <id> <url> <model>       Add a new server');
  console.log('  remove <id>                  Remove a server');
  console.log('  activate <id>                Enable a server');
  console.log('  deactivate <id>              Disable a server');
  console.log('  priority <id> <number>       Set server priority');
  console.log();
  console.log(colorize('Health & Testing:', 'bright'));
  console.log('  health, status               Check all server health');
  console.log('  test <id>                    Test specific server');
  console.log('  validate                     Comprehensive validation');
  console.log('  discover                     Auto-discover servers');
  console.log();
  console.log(colorize('Information:', 'bright'));
  console.log('  select                       Show optimal server selection');
  console.log('  config                       Show configuration file');
  console.log('  stats                        Show statistics');
  console.log('  help                         Show this help');
  console.log();
  console.log(colorize('Examples:', 'bright'));
  console.log('  node model-manager.js add local-qwen http://localhost:8443/api/v1 qwen3-coder-max');
  console.log('  node model-manager.js health');
  console.log('  node model-manager.js discover');
}

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error(colorize('💥 Unhandled Promise Rejection:', 'red'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(colorize('💥 Uncaught Exception:', 'red'), error.message);
  process.exit(1);
});

// 실행
main().catch(error => {
  console.error(colorize('💥 Fatal error:', 'red'), error.message);
  process.exit(1);
});