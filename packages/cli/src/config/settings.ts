/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { homedir, platform } from 'os';
import * as dotenv from 'dotenv';
import {
  MCPServerConfig,
  GEMINI_CONFIG_DIR as GEMINI_DIR,
  getErrorMessage,
  BugCommandSettings,
  TelemetrySettings,
  AuthType,
} from '@qwen-code/qwen-code-core';
import stripJsonComments from 'strip-json-comments';
import { DefaultLight } from '../ui/themes/default-light.js';
import { DefaultDark } from '../ui/themes/default.js';

export const SETTINGS_DIRECTORY_NAME = '.qwen';
export const USER_SETTINGS_DIR = path.join(homedir(), SETTINGS_DIRECTORY_NAME);
export const USER_SETTINGS_PATH = path.join(USER_SETTINGS_DIR, 'settings.json');

function getSystemSettingsPath(): string {
  if (platform() === 'darwin') {
    return '/Library/Application Support/QwenCode/settings.json';
  } else if (platform() === 'win32') {
    return 'C:\\ProgramData\\qwen-code\\settings.json';
  } else {
    return '/etc/qwen-code/settings.json';
  }
}

export const SYSTEM_SETTINGS_PATH = getSystemSettingsPath();

export enum SettingScope {
  User = 'User',
  Workspace = 'Workspace',
  System = 'System',
}

export interface CheckpointingSettings {
  enabled?: boolean;
}

export interface AccessibilitySettings {
  disableLoadingPhrases?: boolean;
}

export interface Settings {
  theme?: string;
  selectedAuthType?: AuthType;
  sandbox?: boolean | string;
  coreTools?: string[];
  excludeTools?: string[];
  toolDiscoveryCommand?: string;
  toolCallCommand?: string;
  mcpServerCommand?: string;
  mcpServers?: Record<string, MCPServerConfig>;
  showMemoryUsage?: boolean;
  contextFileName?: string | string[];
  accessibility?: AccessibilitySettings;
  telemetry?: TelemetrySettings;
  usageStatisticsEnabled?: boolean;
  preferredEditor?: string;
  bugCommand?: BugCommandSettings;
  checkpointing?: CheckpointingSettings;
  autoConfigureMaxOldSpaceSize?: boolean;
  enableOpenAILogging?: boolean;

  // Git-aware file filtering settings
  fileFiltering?: {
    respectGitIgnore?: boolean;
    enableRecursiveFileSearch?: boolean;
  };

  // UI setting. Does not display the ANSI-controlled terminal title.
  hideWindowTitle?: boolean;
  hideTips?: boolean;
  hideBanner?: boolean;

  // Setting for setting maximum number of user/model/tool turns in a session.
  maxSessionTurns?: number;

  // Sampling parameters for content generation
  sampling_params?: {
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    temperature?: number;
    max_tokens?: number;
  };

  // Add other settings here.
  ideMode?: boolean;
}

export interface SettingsError {
  message: string;
  path: string;
}

export interface SettingsFile {
  settings: Settings;
  path: string;
}
export class LoadedSettings {
  constructor(
    system: SettingsFile,
    user: SettingsFile,
    workspace: SettingsFile,
    errors: SettingsError[],
  ) {
    this.system = system;
    this.user = user;
    this.workspace = workspace;
    this.errors = errors;
    this._merged = this.computeMergedSettings();
  }

  readonly system: SettingsFile;
  readonly user: SettingsFile;
  readonly workspace: SettingsFile;
  readonly errors: SettingsError[];

  private _merged: Settings;

  get merged(): Settings {
    return this._merged;
  }

  private computeMergedSettings(): Settings {
    return {
      ...this.user.settings,
      ...this.workspace.settings,
      ...this.system.settings,
    };
  }

  forScope(scope: SettingScope): SettingsFile {
    switch (scope) {
      case SettingScope.User:
        return this.user;
      case SettingScope.Workspace:
        return this.workspace;
      case SettingScope.System:
        return this.system;
      default:
        throw new Error(`Invalid scope: ${scope}`);
    }
  }

  setValue(
    scope: SettingScope,
    key: keyof Settings,
    value: string | Record<string, MCPServerConfig> | undefined,
  ): void {
    const settingsFile = this.forScope(scope);
    // @ts-expect-error - value can be string | Record<string, MCPServerConfig>
    settingsFile.settings[key] = value;
    this._merged = this.computeMergedSettings();
    saveSettings(settingsFile);
  }
}

function resolveEnvVarsInString(value: string): string {
  const envVarRegex = /\$(?:(\w+)|{([^}]+)})/g; // Find $VAR_NAME or ${VAR_NAME}
  return value.replace(envVarRegex, (match, varName1, varName2) => {
    const varName = varName1 || varName2;
    if (process && process.env && typeof process.env[varName] === 'string') {
      return process.env[varName]!;
    }
    return match;
  });
}

function resolveEnvVarsInObject<T>(obj: T): T {
  if (
    obj === null ||
    obj === undefined ||
    typeof obj === 'boolean' ||
    typeof obj === 'number'
  ) {
    return obj;
  }

  if (typeof obj === 'string') {
    return resolveEnvVarsInString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveEnvVarsInObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const newObj = { ...obj } as T;
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        newObj[key] = resolveEnvVarsInObject(newObj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

function findEnvFile(startDir: string): string | null {
  let currentDir = path.resolve(startDir);
  while (true) {
    // prefer gemini-specific .env under GEMINI_DIR
    const geminiEnvPath = path.join(currentDir, GEMINI_DIR, '.env');
    if (fs.existsSync(geminiEnvPath)) {
      return geminiEnvPath;
    }
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir || !parentDir) {
      // check .env under home as fallback, again preferring gemini-specific .env
      const homeGeminiEnvPath = path.join(homedir(), GEMINI_DIR, '.env');
      if (fs.existsSync(homeGeminiEnvPath)) {
        return homeGeminiEnvPath;
      }
      const homeEnvPath = path.join(homedir(), '.env');
      if (fs.existsSync(homeEnvPath)) {
        return homeEnvPath;
      }
      return null;
    }
    currentDir = parentDir;
  }
}

export function setUpCloudShellEnvironment(envFilePath: string | null): void {
  // Special handling for GOOGLE_CLOUD_PROJECT in Cloud Shell:
  // Because GOOGLE_CLOUD_PROJECT in Cloud Shell tracks the project
  // set by the user using "gcloud config set project" we do not want to
  // use its value. So, unless the user overrides GOOGLE_CLOUD_PROJECT in
  // one of the .env files, we set the Cloud Shell-specific default here.
  if (envFilePath && fs.existsSync(envFilePath)) {
    const envFileContent = fs.readFileSync(envFilePath);
    const parsedEnv = dotenv.parse(envFileContent);
    if (parsedEnv.GOOGLE_CLOUD_PROJECT) {
      // .env file takes precedence in Cloud Shell
      process.env.GOOGLE_CLOUD_PROJECT = parsedEnv.GOOGLE_CLOUD_PROJECT;
    } else {
      // If not in .env, set to default and override global
      process.env.GOOGLE_CLOUD_PROJECT = 'cloudshell-gca';
    }
  } else {
    // If no .env file, set to default and override global
    process.env.GOOGLE_CLOUD_PROJECT = 'cloudshell-gca';
  }
}

export function loadEnvironment(): void {
  const envFilePath = findEnvFile(process.cwd());

  if (process.env.CLOUD_SHELL === 'true') {
    setUpCloudShellEnvironment(envFilePath);
  }

  if (envFilePath) {
    dotenv.config({ path: envFilePath, quiet: true });
  }

  // 내부망 LLM 자동 감지 설정
  autoConfigureInternalLlm();
}

function autoConfigureInternalLlm(): void {
  // QWEN_AUTH_TYPE가 설정되어 있으면 그대로 사용
  if (process.env.QWEN_AUTH_TYPE) {
    return;
  }

  // 글로벌 설치 시 홈 디렉토리의 .qwen 폴더에서 설정 확인
  const homeQwenDir = path.join(USER_SETTINGS_DIR);
  const globalEnvPath = path.join(homeQwenDir, '.env');
  
  // 글로벌 .env 파일이 있는지 확인
  if (fs.existsSync(globalEnvPath)) {
    try {
      dotenv.config({ path: globalEnvPath, quiet: true });
      console.log('💡 내부망 LLM 글로벌 설정을 로드했습니다.');
    } catch (error) {
      // 에러 무시하고 계속
    }
  }

  // 환경변수 기반 자동 감지
  // requirement.md 명세에 맞는 환경변수 검사
  const hasInternalLlmConfig = process.env.LLM_BASE_URL || process.env.PROXY_SERVER_URL || 
                              process.env.INTERNAL_LLM_BASE_URL || process.env.INTERNAL_LLM_API_KEY || 
                              process.env.INTERNAL_LLM_MODEL;
  
  if (hasInternalLlmConfig) {
    console.log('🚀 내부망 LLM 모드로 실행합니다.');
    process.env.QWEN_AUTH_TYPE = AuthType.USE_INTERNAL_LLM;
    
    // DISABLE_SSL_SKIP이 true가 아닌 경우에만 SSL 우회 적용
    if (process.env.DISABLE_SSL_SKIP !== 'true') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SSL 우회 자동 설정
    }
    
    // 기본값 설정 (하위호환성 유지)
    if (!process.env.INTERNAL_LLM_BASE_URL && !process.env.LLM_BASE_URL && !process.env.PROXY_SERVER_URL) {
      process.env.INTERNAL_LLM_BASE_URL = 'http://localhost:8443/devport/api/v1';
    }
    if (!process.env.INTERNAL_LLM_API_KEY) {
      process.env.INTERNAL_LLM_API_KEY = 'test-key';
    }
    if (!process.env.INTERNAL_LLM_MODEL) {
      process.env.INTERNAL_LLM_MODEL = 'internal-llm-model';
    }
    
    return;
  }
}

/**
 * Loads settings from user and workspace directories.
 * Project settings override user settings.
 */
export function loadSettings(workspaceDir: string): LoadedSettings {
  loadEnvironment();
  let systemSettings: Settings = {};
  let userSettings: Settings = {};
  let workspaceSettings: Settings = {};
  const settingsErrors: SettingsError[] = [];

  // Load system settings
  try {
    if (fs.existsSync(SYSTEM_SETTINGS_PATH)) {
      const systemContent = fs.readFileSync(SYSTEM_SETTINGS_PATH, 'utf-8');
      const parsedSystemSettings = JSON.parse(
        stripJsonComments(systemContent),
      ) as Settings;
      systemSettings = resolveEnvVarsInObject(parsedSystemSettings);
    }
  } catch (error: unknown) {
    settingsErrors.push({
      message: getErrorMessage(error),
      path: SYSTEM_SETTINGS_PATH,
    });
  }

  // Load user settings
  try {
    if (fs.existsSync(USER_SETTINGS_PATH)) {
      const userContent = fs.readFileSync(USER_SETTINGS_PATH, 'utf-8');
      const parsedUserSettings = JSON.parse(
        stripJsonComments(userContent),
      ) as Settings;
      userSettings = resolveEnvVarsInObject(parsedUserSettings);
      // Support legacy theme names
      if (userSettings.theme && userSettings.theme === 'VS') {
        userSettings.theme = DefaultLight.name;
      } else if (userSettings.theme && userSettings.theme === 'VS2015') {
        userSettings.theme = DefaultDark.name;
      }
    }
  } catch (error: unknown) {
    settingsErrors.push({
      message: getErrorMessage(error),
      path: USER_SETTINGS_PATH,
    });
  }

  const workspaceSettingsPath = path.join(
    workspaceDir,
    SETTINGS_DIRECTORY_NAME,
    'settings.json',
  );

  // Load workspace settings
  try {
    if (fs.existsSync(workspaceSettingsPath)) {
      const projectContent = fs.readFileSync(workspaceSettingsPath, 'utf-8');
      const parsedWorkspaceSettings = JSON.parse(
        stripJsonComments(projectContent),
      ) as Settings;
      workspaceSettings = resolveEnvVarsInObject(parsedWorkspaceSettings);
      if (workspaceSettings.theme && workspaceSettings.theme === 'VS') {
        workspaceSettings.theme = DefaultLight.name;
      } else if (
        workspaceSettings.theme &&
        workspaceSettings.theme === 'VS2015'
      ) {
        workspaceSettings.theme = DefaultDark.name;
      }
    }
  } catch (error: unknown) {
    settingsErrors.push({
      message: getErrorMessage(error),
      path: workspaceSettingsPath,
    });
  }

  return new LoadedSettings(
    {
      path: SYSTEM_SETTINGS_PATH,
      settings: systemSettings,
    },
    {
      path: USER_SETTINGS_PATH,
      settings: userSettings,
    },
    {
      path: workspaceSettingsPath,
      settings: workspaceSettings,
    },
    settingsErrors,
  );
}

export function saveSettings(settingsFile: SettingsFile): void {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(settingsFile.path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
      settingsFile.path,
      JSON.stringify(settingsFile.settings, null, 2),
      'utf-8',
    );
  } catch (error) {
    console.error('Error saving user settings file:', error);
  }
}
