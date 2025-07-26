/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type Model = string;
type TokenCount = number;

export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: Model): TokenCount {
  // Add other models as they become relevant or if specified by config
  // Pulled from https://ai.google.dev/gemini-api/docs/models
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro-preview-05-06':
    case 'gemini-2.5-pro-preview-06-05':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash-preview-05-20':
    case 'gemini-2.5-flash':
    case 'gemini-2.0-flash':
      return 1_048_576;
    case 'gemini-2.0-flash-preview-image-generation':
      return 32_000;
    // Qwen models - on-premise context limits
    case 'qwen3-235b-a22b-2507':
    case 'qwen2.5-72b-instruct':
    case 'qwen2.5-32b-instruct':
    case 'qwen2.5-14b-instruct':
    case 'qwen2.5-7b-instruct':
      return 262_144; // 256K context window
    case 'qwen2.5-3b-instruct':
    case 'qwen2.5-1.5b-instruct':
    case 'qwen2.5-0.5b-instruct':
      return 131_072; // 128K context window for smaller models
    // Generic Qwen model patterns
    default:
      if (model.toLowerCase().includes('qwen')) {
        return 262_144; // Default 256K for any Qwen model
      }
      return DEFAULT_TOKEN_LIMIT;
  }
}
