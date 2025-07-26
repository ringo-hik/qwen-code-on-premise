
# 2. User Guide and Development Philosophy

## 2.1. Development Philosophy

The on-premise adaptation of `qwen-code` was guided by a single, overarching principle: **Minimum Modification, Maximum Impact.**

This philosophy was born from the understanding that the target environment—a secure, air-gapped corporate network—demands stability, security, and minimal disruption. The goal was not to rewrite the application, but to surgically adapt it to meet the specific constraints of the on-premise world.

### **Core Tenets:**

1.  **Simplicity is Paramount:** The user experience should be as close to the original as possible. Installation should be a single command, and configuration should be managed entirely through environment variables and a simple JSON file. No complex setup, no learning curve.

2.  **Isolate Changes:** All modifications were carefully contained within their respective modules. The SSL bypass is a small, conditional block in the fetch utility, and the internal web search is a self-contained replacement for the original tool. This ensures that our changes are predictable and have no unintended side effects.

3.  **No New Dependencies:** To maintain security and ease of installation, no new third-party packages were introduced. The solution relies entirely on the existing Node.js runtime and the project's original dependencies.

4.  **Empower the User:** The `internal-web-config.json` file puts the power in the hands of the user. They can easily add, remove, or modify the internal sites the tool can search without needing to touch the application's code. This makes the tool adaptable to any organization's internal knowledge base.

By adhering to these principles, we created a solution that is not only functional but also robust, secure, and easy to maintain. It is a testament to the power of thoughtful, targeted modifications over large-scale, disruptive changes.

---

## 2.2. Installation and Configuration Guide

This guide provides step-by-step instructions for installing and configuring `one-code` in an on-premise environment.

### **Prerequisites:**

*   **Node.js:** Version 20.0.0 or higher.
*   **Network Access:** The machine must have network access to your internal LLM server.

### **Step 1: Install Node.js**

If you do not have Node.js installed, download the LTS version from the [official Node.js website](https://nodejs.org/) and install it.

### **Step 2: Install One Code**

Install the `one-code` package globally using `npm`:

```bash
npm install -g @one-code/one-code
```

### **Step 3: Configure Environment Variables**

These environment variables are required to connect to your internal LLM and enable on-premise features.

#### **For Windows (PowerShell):**

```powershell
# Set environment variables for the current session
$env:OPENAI_BASE_URL="http://your-internal-llm.company.com:8080/v1"
$env:OPENAI_API_KEY="your-internal-api-key"
$env:ON_PREMISE_MODE="true"
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"

# To make them permanent, add them to your PowerShell profile or set them in the System Properties.
```

#### **For Linux/macOS:**

```bash
# Add the following lines to your ~/.bashrc or ~/.zshrc file
export OPENAI_BASE_URL="http://your-internal-llm.company.com:8080/v1"
export OPENAI_API_KEY="your-internal-api-key"
export ON_PREMISE_MODE="true"
export NODE_TLS_REJECT_UNAUTHORIZED="0"

# Apply the changes
source ~/.bashrc
```

### **Step 4: Configure Internal Web Search (Optional)**

To use the internal web search feature, you need to create a configuration file.

1.  **Create the `internal-web-config.json` file:**

    Create this file in a location of your choice (e.g., your home directory). Add the URLs of your internal knowledge bases, along with a description for each.

    ```json
    {
      "enabled": true,
      "timeout": 10000,
      "urls": {
        "company_wiki": {
          "url": "http://wiki.company.com",
          "description": "Internal company wiki, development guides, API documentation, and technical standards."
        },
        "api_docs": {
          "url": "http://api-docs.internal.com",
          "description": "Internal API reference, REST API documentation, and authentication guides."
        }
      }
    }
    ```

2.  **Set the `INTERNAL_WEB_CONFIG_PATH` environment variable:**

    This variable should point to the absolute path of your `internal-web-config.json` file.

    #### **For Windows (PowerShell):**

    ```powershell
    $env:INTERNAL_WEB_CONFIG_PATH="C:\Users\YourUser\internal-web-config.json"
    ```

    #### **For Linux/macOS:**

    ```bash
    export INTERNAL_WEB_CONFIG_PATH="/home/YourUser/internal-web-config.json"
    ```

### **Step 5: Verify the Installation**

1.  **Check the version:**

    ```bash
    one --version
    ```

2.  **Test the connection to your LLM:**

    ```bash
    one "Hello! Are you there?"
    ```

3.  **Test the internal web search:**

    ```bash
    one "Find the API authentication guide."
    ```

If you receive a valid response, your on-premise `one-code` is ready to use.

---

## 2.3. Beginner's Guide and Troubleshooting

### **For the Absolute Beginner**

If you are new to command-line tools and development environments, here is a more detailed walkthrough for Windows.

1.  **Install Chocolatey (a package manager for Windows):**
    Open PowerShell as an administrator and run:
    ```powershell
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```

2.  **Install Node.js using Chocolatey:**
    ```powershell
    choco install nodejs-lts
    ```

3.  **Follow Steps 2-5 from the Installation Guide.**

### **Troubleshooting Common Issues**

*   **Error: `one: command not found`**
    *   **Cause:** The `npm` global directory is not in your system's PATH.
    *   **Solution:** Add the `npm` global bin directory to your PATH. You can find the directory by running `npm config get prefix`.

*   **Error: `Connection refused` or `ECONNREFUSED`**
    *   **Cause:** The `OPENAI_BASE_URL` is incorrect, or the LLM server is not running.
    *   **Solution:**
        1.  Verify the URL and port.
        2.  Use `curl` or `ping` to check if the server is reachable from your machine.

*   **Error: `SSL certificate problem` or `UNABLE_TO_VERIFY_LEAF_SIGNATURE`**
    *   **Cause:** The `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable is not set correctly.
    *   **Solution:** Ensure the variable is set and exported in your shell profile.

*   **Internal Web Search Fails:**
    *   **Cause:** The `INTERNAL_WEB_CONFIG_PATH` is incorrect, or the JSON file is malformed.
    *   **Solution:**
        1.  Verify the file path is correct.
        2.  Use a JSON validator to check for syntax errors in your `internal-web-config.json` file.
