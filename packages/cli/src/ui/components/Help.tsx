/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { SlashCommand } from '../commands/types.js';
import { isInternalLlmMode } from '@qwen-code/qwen-code-core';

interface Help {
  commands: SlashCommand[];
}

export const Help: React.FC<Help> = ({ commands }) => {
  const isInternalMode = isInternalLlmMode();

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      borderColor={Colors.Gray}
      borderStyle="round"
      padding={1}
    >
    {/* 내부망 LLM 모드 안내 */}
    {isInternalMode && (
      <>
        <Box
          borderColor={Colors.AccentPurple}
          borderStyle="single"
          padding={1}
          marginBottom={1}
        >
          <Box flexDirection="column">
            <Text bold color={Colors.AccentPurple}>
              🔒 내부망 LLM 모드 활성화됨
            </Text>
            <Text color={Colors.Foreground}>
              현재 내부망 LLM 서버를 사용하고 있습니다.
            </Text>
            <Text color={Colors.Foreground}>
              연결 문제가 있는 경우:
            </Text>
            <Text color={Colors.AccentPurple}>
              • /validate - 설정 검증
            </Text>
            <Text color={Colors.AccentPurple}>
              • /diagnose - 빠른 진단
            </Text>
          </Box>
        </Box>
      </>
    )}

    {/* Basics */}
    <Text bold color={Colors.Foreground}>
      Basics:
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Add context
      </Text>
      : Use{' '}
      <Text bold color={Colors.AccentPurple}>
        @
      </Text>{' '}
      to specify files for context (e.g.,{' '}
      <Text bold color={Colors.AccentPurple}>
        @src/myFile.ts
      </Text>
      ) to target specific files or folders.
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Shell mode
      </Text>
      : Execute shell commands via{' '}
      <Text bold color={Colors.AccentPurple}>
        !
      </Text>{' '}
      (e.g.,{' '}
      <Text bold color={Colors.AccentPurple}>
        !npm run start
      </Text>
      ) or use natural language (e.g.{' '}
      <Text bold color={Colors.AccentPurple}>
        start server
      </Text>
      ).
    </Text>

    <Box height={1} />

    {/* Commands */}
    <Text bold color={Colors.Foreground}>
      Commands:
    </Text>
    {commands
      .filter((command) => command.description)
      .map((command: SlashCommand) => (
        <Box key={command.name} flexDirection="column">
          <Text color={Colors.Foreground}>
            <Text bold color={Colors.AccentPurple}>
              {' '}
              /{command.name}
            </Text>
            {command.description && ' - ' + command.description}
          </Text>
          {command.subCommands &&
            command.subCommands.map((subCommand) => (
              <Text key={subCommand.name} color={Colors.Foreground}>
                <Text bold color={Colors.AccentPurple}>
                  {'   '}
                  {subCommand.name}
                </Text>
                {subCommand.description && ' - ' + subCommand.description}
              </Text>
            ))}
        </Box>
      ))}
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        {' '}
        !{' '}
      </Text>
      - shell command
    </Text>

    <Box height={1} />

    {/* Shortcuts */}
    <Text bold color={Colors.Foreground}>
      Keyboard Shortcuts:
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Enter
      </Text>{' '}
      - Send message
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        {process.platform === 'win32' ? 'Ctrl+Enter' : 'Ctrl+J'}
      </Text>{' '}
      {process.platform === 'linux'
        ? '- New line (Alt+Enter works for certain linux distros)'
        : '- New line'}
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Up/Down
      </Text>{' '}
      - Cycle through your prompt history
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Alt+Left/Right
      </Text>{' '}
      - Jump through words in the input
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Shift+Tab
      </Text>{' '}
      - Toggle auto-accepting edits
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Ctrl+Y
      </Text>{' '}
      - Toggle YOLO mode
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Esc
      </Text>{' '}
      - Cancel operation
    </Text>
    <Text color={Colors.Foreground}>
      <Text bold color={Colors.AccentPurple}>
        Ctrl+C
      </Text>{' '}
      - Quit application
    </Text>
  </Box>
  );
};
