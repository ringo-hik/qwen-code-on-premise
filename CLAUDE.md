# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Workflow
- `npm install` - Install dependencies 
- `npm run build` - Build the main project (TypeScript compilation and bundling)
- `npm run build:all` - Build main project and sandbox container
- `npm start` - Start the Qwen CLI from source
- `npm run debug` - Start CLI in debug mode with Node.js inspector

### Code Quality
- `npm run lint` - Run ESLint on TypeScript and integration test files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking across all packages
- `npm run preflight` - Full pre-commit check (clean, install, format, lint, build, typecheck, test)

### Testing
- `npm run test` - Run unit tests across all packages
- `npm run test:ci` - Run tests with CI configuration
- `npm run test:e2e` - Run end-to-end integration tests
- `npm run test:integration:sandbox:none` - Integration tests without sandbox
- `npm run test:integration:sandbox:docker` - Integration tests with Docker sandbox
- `npm run test:integration:sandbox:podman` - Integration tests with Podman sandbox

### Utilities
- `npm run clean` - Remove generated files and build artifacts
- `make help` - Show available Makefile targets
- `scripts/create_alias.sh` - Create shell alias for the CLI

## Architecture Overview

This is a monorepo with workspaces containing a CLI tool adapted from Google's Gemini CLI, optimized for Qwen-Coder models.

### Package Structure
- **`packages/cli/`** - Frontend user interface (React/Ink-based terminal UI)
  - Handles user input, display rendering, themes, history management
  - Main entry point: `packages/cli/src/gemini.tsx`
  - UI components in `packages/cli/src/ui/`

- **`packages/core/`** - Backend logic and API integration
  - API client for Qwen/OpenAI-compatible endpoints  
  - Tool registration and execution (`packages/core/src/tools/`)
  - Chat management and prompt construction
  - State management for conversations

- **`packages/vscode-ide-companion/`** - VS Code extension for IDE integration

### Key Components

#### Tools System (`packages/core/src/tools/`)
Tools extend model capabilities for local environment interaction:
- `edit.ts` - File editing operations
- `read-file.ts`, `read-many-files.ts` - File reading
- `write-file.ts` - File writing
- `shell.ts` - Shell command execution  
- `grep.ts`, `glob.ts` - File searching
- `web-fetch.ts`, `web-search.ts` - Web operations
- `mcp-client.ts` - Model Context Protocol integration

#### Configuration & Authentication
- Supports multiple API providers (Alibaba Cloud DashScope, ModelScope)
- Environment variables: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
- Settings stored in `.qwen/` directory
- Sandboxing support via macOS Seatbelt, Docker, or Podman

#### Interaction Flow
1. CLI receives user input → Core processes request
2. Core constructs prompt → Sends to API
3. API responds with text/tool calls → Core executes approved tools
4. Tool results sent back to API → Final response to CLI

## Development Notes

### Prerequisites
- Node.js >=20 (development requires ~20.19.0 due to dependency constraints)
- Git

### Import Rules  
- Enforced by `eslint-rules/no-relative-cross-package-imports.js`
- No relative imports between packages - use absolute imports

### Sandboxing
- Development: Set `GEMINI_SANDBOX=true` in `~/.env` 
- Requires Docker/Podman or uses macOS Seatbelt by default
- Custom sandbox configs in `.qwen/sandbox.Dockerfile` or `.qwen/sandbox.bashrc`

### Testing Requirements
- Unit tests with Vitest
- Integration tests in `integration-tests/` directory  
- All tests must pass before PR submission
- Use `npm run preflight` for comprehensive pre-commit validation

### TypeScript Configuration
- Strict mode enabled
- ES2023 target with NodeNext modules
- Composite project structure for workspace builds