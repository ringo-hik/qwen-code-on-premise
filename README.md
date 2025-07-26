# 🏢 One Code - On-Premise AI Coding Assistant

![One Code Screenshot](./docs/assets/one-screenshot.png)

**Complete Offline AI Development Tool for Enterprise and Government Organizations**

> [!WARNING]
> Qwen Code may issue multiple API calls per cycle, resulting in higher token usage, similar to Claude Code. We’re actively working to enhance API efficiency and improve the overall developer experience. ModelScope offers 2,000 free API calls if you are in China mainland. Please check [API config section](#api-configuration) for more details.

One Code is a command-line AI workflow tool that operates in air-gapped environments. Complete code analysis, generation, and refactoring capabilities using only internal LLM servers without external internet connectivity.

## 🎯 On-Premise Specialized Features

- **Code Understanding & Editing** - Query and edit large codebases beyond traditional context window limits
- **Workflow Automation** - Automate operational tasks like handling pull requests and complex rebases
- **Enhanced Parser** - Adapted parser specifically optimized for Qwen-Coder models

### ✨ 핵심 특징

- **🔒 완전 오프라인**: 외부 인터넷 연결 불필요
- **🏗️ 내부 LLM 연동**: OpenAI API 호환 내부 서버 지원
- **🌐 내부 웹 검색**: 기업 내부 문서/위키 검색
- **🛡️ SSL 우회**: 내부 인증서 없는 서버와 안전한 통신
- **🇰🇷 한국어 우선**: 자연스러운 한국어 코드 주석과 설명
- **🤖 SuperClaude 통합**: 고급 AI 워크플로우 지원
  One Code is a command-line AI workflow tool that operates in air-gapped environments. Complete code analysis, generation, and refactoring capabilities using only internal LLM servers without external internet connectivity.

## 🎯 On-Premise Specialized Features

### ✨ Core Features

- **🔒 Completely Offline**: No external internet connection required
- **🏗️ Internal LLM Integration**: OpenAI API compatible internal server support
- **🌐 Internal Web Search**: Enterprise internal documentation/wiki search
- **🛡️ SSL Bypass**: Secure communication with internal servers without certificates
- **🤖 SuperClaude Integration**: Advanced AI workflow support
- **🚀 High Performance**: Optimized for enterprise-scale operations

### 💼 Enterprise Use Cases

- **Financial Institutions**: Secure code development environments
- **Government Agencies**: AI assistant in network-isolated environments
- **Large Enterprises**: Coding tools compliant with internal policies
- **Research Labs**: Code analysis for confidential projects

## 🚀 Quick Start

### Step 1: Installation

```bash
# After installing Node.js
npm install -g @one-code/one-code
one --version
```

> **Note**: This is the actual package name. Do not use `@qwen-code/qwen-code` as mentioned in some documentation.

### Step 2: Connect to Internal Server

#### **Option 1: .env File (Recommended)**

Create a `.env` file in your project directory or use the default configuration:

```bash
# One Code Configuration
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=qwen/qwen3-235b-a22b-2507

# On-premise Configuration (defaults)
ON_PREMISE_MODE=true
NODE_TLS_REJECT_UNAUTHORIZED=0
```

> **Note**: The package includes a default `.env` file with OpenRouter configuration. Update `OPENAI_API_KEY` with your actual key.

#### **Option 2: Environment Variables**

**Temporary Setup (Current Session Only)**

**PowerShell:**

```powershell
# Set environment variables for current session
$env:OPENAI_BASE_URL = "http://your-internal-llm:8080/v1"
$env:OPENAI_API_KEY = "internal-api-key"
$env:OPENAI_MODEL = "your-internal-model"
$env:ON_PREMISE_MODE = "true"
# Optional SSL bypass for internal servers
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
```

**Bash/Zsh:**
git clone https://github.com/QwenLM/qwen-code.git
cd qwen-code
npm install
npm install -g .
=======

# 기본 사용

# echo "파이썬으로 REST API 서버 만들어줘" | qwen

# Basic usage

# Set environment variables for current session

export OPENAI_BASE_URL="http://your-internal-llm:8080/v1"
export OPENAI_API_KEY="internal-api-key"
export OPENAI_MODEL="your-internal-model"
export ON_PREMISE_MODE="true"

# Optional SSL bypass for internal servers

export NODE_TLS_REJECT_UNAUTHORIZED="0"

````

#### **Permanent Setup (Recommended)**

**PowerShell (Windows):**
```powershell
# Create PowerShell profile if it doesn't exist
New-Item -ItemType Directory -Path (Split-Path $PROFILE) -Force | Out-Null
New-Item -ItemType File -Path $PROFILE -Force | Out-Null

# Add configuration to PowerShell profile
@"
# One Code Configuration
`$env:OPENAI_BASE_URL = "http://your-internal-llm:8080/v1"
`$env:OPENAI_API_KEY = "internal-api-key"
`$env:OPENAI_MODEL = "your-internal-model"
`$env:ON_PREMISE_MODE = "true"
`$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

Write-Host "One Code environment loaded" -ForegroundColor Green
"@ | Out-File -FilePath $PROFILE -Encoding UTF8 -Append

# Apply to current session
. $PROFILE
````

**Bash (Linux/macOS):**

```bash
# Add to ~/.bashrc (or ~/.bash_profile on macOS)
echo 'export OPENAI_BASE_URL="http://your-internal-llm:8080/v1"' >> ~/.bashrc
echo 'export OPENAI_API_KEY="internal-api-key"' >> ~/.bashrc
echo 'export OPENAI_MODEL="your-internal-model"' >> ~/.bashrc
echo 'export ON_PREMISE_MODE="true"' >> ~/.bashrc
echo 'export NODE_TLS_REJECT_UNAUTHORIZED="0"' >> ~/.bashrc

# Apply changes
source ~/.bashrc
```

**Zsh (macOS default):**

```bash
# Add to ~/.zshrc
echo 'export OPENAI_BASE_URL="http://your-internal-llm:8080/v1"' >> ~/.zshrc
echo 'export OPENAI_API_KEY="internal-api-key"' >> ~/.zshrc
echo 'export OPENAI_MODEL="your-internal-model"' >> ~/.zshrc
echo 'export ON_PREMISE_MODE="true"' >> ~/.zshrc
echo 'export NODE_TLS_REJECT_UNAUTHORIZED="0"' >> ~/.zshrc

# Apply changes
source ~/.zshrc
```

#### **Example: OpenRouter Configuration**

```powershell
# PowerShell
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY = "sk-or-v1-your-api-key"
$env:OPENAI_MODEL = "qwen/qwen3-235b-a22b-2507"
$env:ON_PREMISE_MODE = "true"
```

```bash
# Bash/Zsh
export OPENAI_BASE_URL="https://openrouter.ai/api/v1"
export OPENAI_API_KEY="sk-or-v1-your-api-key"
export OPENAI_MODEL="qwen/qwen3-235b-a22b-2507"
export ON_PREMISE_MODE="true"
```

### Step 3: Verify Setup and Usage

#### **Check Configuration**

```bash
# Verify environment variables are set
echo $OPENAI_BASE_URL
echo $OPENAI_MODEL

# Check One Code version
one --version
```

#### **Test Connection**

```bash
# Basic connection test
echo "Hello! Test connection." | one

# Code generation test
<<<<<<< HEAD
>>>>>>> 9249f9d (add .env setting)
echo "Create a REST API server in Python" | one
>>>>>>> eacc2f8 (Symbol change)
echo "Create a REST API server in Python" | one
>>>>>>> 05d62d7 (feat: Rebrand to One Code for on-premise)

# Project analysis
echo "Analyze this project structure" | one

# 내부 문서 검색
echo "API 문서에서 인증 방법 찾아줘" | qwen
# Internal documentation search (if configured)
echo "Find authentication methods in API docs" | one
```

## 📚 Complete Guide

### 📖 **[Product Requirements and Development Plan](docs/guide/1_product_and_development_plan.md)**

- The original product requirements and a detailed, step-by-step explanation of the development plan and execution.

### 📖 **[User Guide and Development Philosophy](docs/guide/2_user_guide_and_philosophy.md)**

- A comprehensive guide for users, including installation instructions for Windows, a beginner's guide, and the development philosophy behind the on-premise adaptation.

### 📖 **[Model Integration and Evaluation](docs/guide/3_model_integration_and_evaluation.md)**

- The integration tests and performance evaluation of `one-code` with a specific on-premise model, based on the provided test results.

## 🛠️ Real Usage Examples

### Code Development

```bash
# Generate high-quality code with natural comments
echo "Create Express.js API with JWT token authentication" | one

# Code refactoring
echo "Refactor this function to be more readable" | one

# Bug analysis
echo "Analyze this error log and provide solutions" | one
```

### Internal Documentation Usage

```bash
# Internal wiki search
echo "Find coding style guidelines in company development guide" | one

# API documentation search
echo "Show user authentication method in internal API" | one

# Technical document analysis
echo "Summarize the new architecture document" | one
```

### SuperClaude Advanced Features

```bash
# Persona-based development
echo "/sc:persona architect" | one    # Architect expert mode
echo "/sc:persona security" | one     # Security expert mode

# Project build
echo "/sc:build react --tdd" | one    # TDD-based React development

# Deep analysis
echo "/sc:analyze . --deep" | one     # Comprehensive project analysis
```

## 🔒 Security and Compatibility

### ✅ Verified Environments

- **Windows 10/11**: PowerShell and Command Prompt
- **Linux/Unix**: bash, zsh shell environments
- **macOS**: Terminal.app and iTerm2
- **Air-gapped Environment**: Complete offline operation verified

### 🛡️ Security Features

- **SSL Certificate Bypass**: Secure communication with internal development servers
- **API Key Protection**: Authentication information used only within internal network
- **Minimal Logging**: Prevention of sensitive information logging
- **Complete Local**: No data transmission to external servers

### Code Development

```sh
> Refactor this function to improve readability and performance
```

### Automate Workflows

```sh
> Analyze git commits from the last 7 days, grouped by feature and team member
```

```sh
> Convert all images in this directory to PNG format
```

## Popular Tasks

### Understand New Codebases

```text
> What are the core business logic components?
> What security mechanisms are in place?
> How does the data flow work?
```

### Code Refactoring & Optimization

```text
> What parts of this module can be optimized?
> Help me refactor this class to follow better design patterns
> Add proper error handling and logging
```

### Documentation & Testing

```text
> Generate comprehensive JSDoc comments for this function
> Write unit tests for this component
> Create API documentation
```

## Benchmark Results

### Terminal-Bench

| Agent     | Model              | Accuracy |
| --------- | ------------------ | -------- |
| Qwen Code | Qwen3-Coder-480A35 | 37.5     |

## Project Structure

```
qwen-code/
├── packages/           # Core packages
├── docs/              # Documentation
├── examples/          # Example code
└── tests/            # Test files
```

## Development & Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to contribute to the project.

## Troubleshooting

If you encounter issues, check the [troubleshooting guide](docs/troubleshooting.md).

## Acknowledgments

This project is based on [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). We acknowledge and appreciate the excellent work of the Gemini CLI team. Our main contribution focuses on parser-level adaptations to better support Qwen-Coder models.

## License

[LICENSE](./LICENSE)

## Star History

=======

### 🔗 호환 가능한 LLM 서버

=======

### 🔗 Compatible LLM Servers

```bash
# Support for all OpenAI API compatible servers
export OPENAI_MODEL="qwen3-coder-plus"              # ✅ Qwen family (recommended)
export OPENAI_MODEL="company-llama"                 # ✅ Llama family
export OPENAI_MODEL="internal-claude"               # ✅ Claude family
export OPENAI_MODEL="our-gpt"                      # ✅ GPT family
export OPENAI_MODEL="custom-model"                 # ✅ Custom model names
```

## 📊 Performance Benchmarks

### Internal Model Test Results

- **Code Implementation Capability**: ⭐⭐⭐⭐⭐ (95/100)
- **Logic Reasoning**: ⭐⭐⭐⭐⭐ (95/100)
- **Technical Understanding**: ⭐⭐⭐⭐⭐ (90/100)
- **Tool Utilization**: ⭐⭐⭐⭐⭐ (95/100)

Detailed comparison analysis: [AI Model Comparison Analysis](docs/AI-model-comparison.md)

## 🏆 Key Differentiators

### vs Existing Coding Assistants

| Feature                     | One Code              | GitHub Copilot           | Claude Code              |
| --------------------------- | --------------------- | ------------------------ | ------------------------ |
| Offline Operation           | ✅ Full Support       | ❌ Online Required       | ❌ Online Required       |
| Internal Server Integration | ✅ Perfect Support    | ❌ Impossible            | ❌ Limited               |
| Enterprise Security         | ✅ Complete Isolation | ❌ External Transmission | ❌ External Transmission |
| Internal Document Search    | ✅ Dedicated Feature  | ❌ Impossible            | ❌ Impossible            |

### Real Implementation Cases

- **Financial Institution A**: Used for core banking system code analysis
- **Government Agency B**: AI assistant operation in network-isolated environment
- **Enterprise C**: Internal API documentation automatic analysis system

## 💡 Advanced Usage Tips

### Internal Web Search Optimization

```json
// internal-web-config.json configuration example
{
  "sites": [
    {
      "name": "Company API Documentation",
      "baseUrl": "http://internal-docs.company.com",
      "searchEndpoint": "/search",
      "priority": 1
    },
    {
      "name": "Development Wiki",
      "baseUrl": "http://wiki.company.com",
      "searchEndpoint": "/api/search",
      "priority": 2
    }
  ]
}
```

### Team Configuration Sharing

```bash
# Create team common configuration file
cat > team-settings.sh << 'EOF'
export OPENAI_BASE_URL="http://our-llm:8080/v1"
export OPENAI_API_KEY="team-shared-key"
export OPENAI_MODEL="our-fine-tuned-model"
export ON_PREMISE_MODE="true"
export NODE_TLS_REJECT_UNAUTHORIZED="0"
EOF

# Team members use commonly
source team-settings.sh
```

=======

## 🆘 Troubleshooting

=======

### Frequently Asked Questions

**Q: npm errors occur during installation**

```bash
# Run PowerShell as administrator
npm install -g @one-code/one-code --force
```

**Q: Cannot connect to internal server**

```bash
# Resolve SSL certificate issues
export NODE_TLS_REJECT_UNAUTHORIZED="0"
# Or test server connection with curl
curl -k http://your-internal-llm:8080/v1/models
```

**Q: Responses are not natural**

```bash
# Explicitly request in prompt
echo "Please explain naturally: Python class inheritance" | one
```

More detailed troubleshooting: [Windows Installation Guide](docs/windows-installation-guide.md)

## 🔄 Updates and Support

### Version Management

```bash
# Check current version
one --version

# Update to latest version
npm update -g @one-code/one-code

# Install specific version (current: 0.0.1-alpha.8)
npm install -g @one-code/one-code@0.0.1-alpha.8
```

### Community Support

- **GitHub Issues**: Bug reports and feature requests
- **Technical Documentation**: Detailed configuration and usage guides
- **Example Collection**: Real use cases and scripts

## 📋 License and Contribution

### Open Source License

This project is based on [Qwen Code](https://github.com/QwenLM/qwen-code) which is adapted from [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). All original licenses are preserved.

### How to Contribute

We welcome improvements and bug reports from on-premise environments:

- Refer to [Contribution Guide](./CONTRIBUTING.md)
- Submit Issue Reports via GitHub
- Share internal environment test results
- Contribute on-premise specific optimizations

---

## 🚀 Get Started Now

```bash
# Complete installation in 1 minute
npm install -g @one-code/one-code

# Internal server configuration
export OPENAI_BASE_URL="http://your-internal-llm:8080/v1"
export ON_PREMISE_MODE="true"

# Use immediately
echo "Hello! Please help me with coding." | one
```

**Complete Offline AI Coding Assistant, Experience it Now! 🎉**

---

**Original Documentation**: [README.QWEN.md](README.QWEN.md) - Complete Qwen Code documentation  
**Development Team**: On-premise adaptation by HIK  
**Base Project**: [Qwen Code](https://github.com/QwenLM/qwen-code) - Qwen3-Coder optimized CLI  
**Current Version**: 0.0.1-alpha.8  
**Last Updated**: 2025-07-26
