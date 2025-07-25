/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, Newline } from 'ink';
import Spinner from 'ink-spinner';
import { ModelManager, ModelServerConfig } from '@qwen-code/qwen-code/utils/modelManager.js';
import { ModelSelectionService } from '@qwen-code/qwen-code/services/modelSelectionService.js';
import { Config } from '@qwen-code/qwen-code/config/config.js';

interface ModelsCommandProps {
  config: Config;
  action?: string;
  serverId?: string;
  serverUrl?: string;
  model?: string;
  priority?: number;
}

interface ServerDisplayInfo extends ModelServerConfig {
  status?: 'healthy' | 'unhealthy' | 'checking';
  responseTime?: number;
  lastChecked?: Date;
}

export function ModelsCommand({ 
  config, 
  action = 'list',
  serverId,
  serverUrl,
  model,
  priority 
}: ModelsCommandProps) {
  const [servers, setServers] = useState<ServerDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelService, setModelService] = useState<ModelSelectionService | null>(null);

  useEffect(() => {
    async function initializeService() {
      try {
        const service = new ModelSelectionService(config);
        await service.initialize();
        setModelService(service);
        
        if (action === 'list' || action === 'status') {
          await updateServerList(service);
        } else {
          await handleAction(service);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    initializeService();
  }, [action, serverId, serverUrl, model, priority]);

  const updateServerList = async (service: ModelSelectionService) => {
    const serverList = service.getModelServers();
    const serverInfo: ServerDisplayInfo[] = serverList.map(server => {
      const status = service.getServerStatus(server.id);
      return {
        ...server,
        status: status ? (status.isHealthy ? 'healthy' : 'unhealthy') : 'checking',
        responseTime: status?.responseTime,
        lastChecked: status?.lastChecked
      };
    });
    
    setServers(serverInfo);
  };

  const handleAction = async (service: ModelSelectionService) => {
    try {
      switch (action) {
        case 'add':
          if (!serverId || !serverUrl || !model) {
            throw new Error('Missing required parameters for add action');
          }
          await handleAddServer(service);
          break;
          
        case 'remove':
          if (!serverId) {
            throw new Error('Server ID required for remove action');
          }
          await handleRemoveServer(service);
          break;
          
        case 'activate':
        case 'deactivate':
          if (!serverId) {
            throw new Error('Server ID required for activate/deactivate action');
          }
          await handleToggleServer(service);
          break;
          
        case 'priority':
          if (!serverId || priority === undefined) {
            throw new Error('Server ID and priority required for priority action');
          }
          await handleSetPriority(service);
          break;
          
        case 'health':
          await handleHealthCheck(service);
          break;
          
        default:
          await updateServerList(service);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleAddServer = async (service: ModelSelectionService) => {
    const newServer: ModelServerConfig = {
      id: serverId!,
      name: `Server ${serverId}`,
      baseUrl: serverUrl!,
      model: model!,
      priority: priority || 50,
      isActive: true,
      capabilities: ['chat', 'completion'],
      description: 'Manually added server'
    };
    
    service.addModelServer(newServer);
    await service.saveConfig();
    await service.checkAllServersHealth();
    await updateServerList(service);
  };

  const handleRemoveServer = async (service: ModelSelectionService) => {
    const removed = service.removeModelServer(serverId!);
    if (removed) {
      await service.saveConfig();
      await updateServerList(service);
    } else {
      setError(`Server ${serverId} not found`);
    }
  };

  const handleToggleServer = async (service: ModelSelectionService) => {
    // This would require adding a toggle method to ModelSelectionService
    // For now, we'll just show the current status
    await updateServerList(service);
  };

  const handleSetPriority = async (service: ModelSelectionService) => {
    // This would require adding a setPriority method to ModelSelectionService
    // For now, we'll just show the current status
    await updateServerList(service);
  };

  const handleHealthCheck = async (service: ModelSelectionService) => {
    await service.checkAllServersHealth();
    await updateServerList(service);
  };

  if (loading) {
    return (
      <Box>
        <Text color="blue">
          <Spinner type="dots" />
          {' '}Loading model information...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">❌ Error: {error}</Text>
      </Box>
    );
  }

  if (action === 'add' && !error) {
    return (
      <Box flexDirection="column">
        <Text color="green">✅ Successfully added server: {serverId}</Text>
        <Text>URL: {serverUrl}</Text>
        <Text>Model: {model}</Text>
        <Text>Priority: {priority || 50}</Text>
      </Box>
    );
  }

  if (action === 'remove' && !error) {
    return (
      <Box>
        <Text color="green">✅ Successfully removed server: {serverId}</Text>
      </Box>
    );
  }

  if (action === 'health' && !error) {
    return (
      <Box flexDirection="column">
        <Text color="green">✅ Health check completed</Text>
        <Newline />
        <ServerList servers={servers} showHealth={true} />
      </Box>
    );
  }

  // Default: show server list
  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>🤖 Model Server Management</Text>
      <Text color="gray">═══════════════════════════</Text>
      <Newline />
      
      {servers.length === 0 ? (
        <Text color="yellow">No model servers configured</Text>
      ) : (
        <ServerList servers={servers} showHealth={action === 'status'} />
      )}
      
      <Newline />
      <Text color="gray">Commands:</Text>
      <Text>  qwen /models add --id server1 --url http://localhost:8080/api/v1 --model qwen-model</Text>
      <Text>  qwen /models remove --id server1</Text>
      <Text>  qwen /models health  # Check all server health</Text>
      <Text>  qwen /models status  # Show detailed status</Text>
    </Box>
  );
}

interface ServerListProps {
  servers: ServerDisplayInfo[];
  showHealth?: boolean;
}

function ServerList({ servers, showHealth = false }: ServerListProps) {
  return (
    <Box flexDirection="column">
      {servers.map((server, index) => (
        <Box key={server.id} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color={server.isActive ? "green" : "gray"}>
              {server.isActive ? "●" : "○"}
            </Text>
            <Text> </Text>
            <Text bold>{server.name}</Text>
            <Text color="gray"> ({server.id})</Text>
            {showHealth && (
              <>
                <Text> - </Text>
                <StatusIndicator status={server.status} />
                {server.responseTime && (
                  <Text color="gray"> ({server.responseTime}ms)</Text>
                )}
              </>
            )}
          </Box>
          
          <Box marginLeft={2}>
            <Text color="gray">URL: </Text>
            <Text>{server.baseUrl}</Text>
          </Box>
          
          <Box marginLeft={2}>
            <Text color="gray">Model: </Text>
            <Text>{server.model}</Text>
            <Text color="gray"> | Priority: </Text>
            <Text>{server.priority}</Text>
          </Box>
          
          {server.capabilities && (
            <Box marginLeft={2}>
              <Text color="gray">Capabilities: </Text>
              <Text>{server.capabilities.join(', ')}</Text>
            </Box>
          )}
          
          {server.description && (
            <Box marginLeft={2}>
              <Text color="gray">{server.description}</Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

interface StatusIndicatorProps {
  status?: 'healthy' | 'unhealthy' | 'checking';
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  switch (status) {
    case 'healthy':
      return <Text color="green">✅ Healthy</Text>;
    case 'unhealthy':
      return <Text color="red">❌ Unhealthy</Text>;
    case 'checking':
      return (
        <Text color="yellow">
          <Spinner type="dots" />
          {' '}Checking...
        </Text>
      );
    default:
      return <Text color="gray">❓ Unknown</Text>;
  }
}