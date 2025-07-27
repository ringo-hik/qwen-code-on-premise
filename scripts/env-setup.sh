#!/bin/bash
# Bash Environment Setup Script for Qwen Code On-Premise

ENV_FILE=".env"
INTERACTIVE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --interactive|-i)
            INTERACTIVE=true
            shift
            ;;
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "\033[32mQwen Code On-Premise Environment Setup\033[0m"
echo -e "\033[32m=======================================\033[0m"

if [ "$INTERACTIVE" = true ]; then
    echo -e "\n\033[33mInteractive Setup Mode\033[0m"
    
    read -p "Enter your internal LLM server URL (e.g., http://your-server:8080/v1): " base_url
    read -p "Enter your API key: " api_key
    read -p "Enter your model name (e.g., qwen3-235b-a22b-2507): " model
    read -p "Bypass SSL verification? (y/n): " ssl_bypass
    
    cat > "$ENV_FILE" << EOF
# Qwen Code On-Premise Configuration
OPENAI_BASE_URL=$base_url
OPENAI_API_KEY=$api_key
OPENAI_MODEL=$model
ON_PREMISE_MODE=true
EOF

    if [[ "$ssl_bypass" == "y" || "$ssl_bypass" == "Y" ]]; then
        echo "NODE_TLS_REJECT_UNAUTHORIZED=0" >> "$ENV_FILE"
    fi
    
    echo -e "\n\033[32m✅ .env file created successfully!\033[0m"
else
    echo -e "\n\033[33mQuick Setup Commands:\033[0m"
    echo "1. Copy example file:"
    echo -e "   \033[36mcp .env.example .env\033[0m"
    echo ""
    echo "2. Edit .env file with your settings"
    echo ""
    echo "3. Or use interactive mode:"
    echo -e "   \033[36m./scripts/env-setup.sh --interactive\033[0m"
fi

echo -e "\n\033[33mExample .env file format:\033[0m"
echo -e "\033[90m
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=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
OPENAI_MODEL=qwen/qwen3-235b-a22b-2507
NODE_TLS_REJECT_UNAUTHORIZED=0
INTERNAL_WEB_CONFIG_PATH=./internal-web-config.json

echo -e "\n\033[32mAfter creating .env file, simply run: qwen-one\033[0m"