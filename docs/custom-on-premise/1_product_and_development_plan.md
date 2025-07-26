
# 1. Product Requirements and Development Plan

## 1.1. Original Product Requirements Document (PRD)

> The following is the original set of requirements for adapting `qwen-code` for on-premise use.

### **Core Request:**

"I need to use this program in an on-premise, air-gapped network. The internal LLM server follows the OpenAI API standard (similar to OpenRouter), but it does not have an SSL certificate, so I need a way to bypass SSL verification. I am not familiar with this project's codebase and have only used it by installing it globally via `npm install -g`.

The `web_search` tool cannot use the Google API. It must be modified to use a predefined list of internal URLs. This list should be managed in a separate configuration file containing URL-description pairs. The tool should intelligently select the appropriate URL based on the user's query and the description.

The key is **simplicity**. The goal is a Proof of Concept (PoC) to demonstrate that a coding agent can run in our internal network with minimal or no code changes. The ideal scenario is: a user installs the tool with a single command, configures it with environment variables, and then uses the `qwen` command seamlessly. The tool should automatically connect to the internal LLM and use the internal URL list for web-related queries."

### **Project Goal:**

To create a PoC of the `qwen-code` AI coding assistant that operates in a closed, on-premise environment by connecting to an internal LLM server with minimal code modifications.

### **Key Features:**

1.  **Internal LLM Integration (FR-001):**
    *   **Requirement:** `qwen-code` must communicate with the internal LLM server.
    *   **Implementation:** Use the `OPENAI_BASE_URL` environment variable to redirect API calls.
    *   **Priority:** Critical (P0).

2.  **SSL Certificate Bypass (FR-002):**
    *   **Requirement:** Bypass SSL verification for internal HTTP communication.
    *   **Implementation:** Use the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable.
    *   **Priority:** Critical (P0).

3.  **Internal Web Search (FR-003):**
    *   **Requirement:** Implement a web search capability that uses a predefined list of internal URLs.
    *   **Implementation:**
        *   Create an `internal-web-config.json` file to manage URL-description mappings.
        *   The AI will select the best URL based on the query and the description.
        *   The tool will then crawl the selected URL for information.
    *   **Priority:** High (P1).

4.  **Simplified Installation and Usage (FR-004):**
    *   **Requirement:** Ensure a straightforward setup and user experience.
    *   **Implementation:**
        *   Single-command installation via `npm`.
        *   Configuration managed entirely through environment variables.
        *   No changes to the existing `qwen` command-line interface.
    *   **Priority:** Critical (P0).

### **Success Criteria:**

*   **PoC Success:**
    *   Successful communication with the internal LLM server.
    *   Core `qwen` commands are fully functional.
    *   At least one successful web search using the internal URL list.
*   **End-to-End Scenario:**
    1.  A user installs the package with `npm install -g`.
    2.  The user sets the required environment variables.
    3.  The user runs a command like `qwen "Find the authentication method in the API docs."`
    4.  The tool connects to the internal LLM, performs a search on the internal web, and provides a relevant answer.

---

## 1.2. Development Plan and Execution

The development was executed following a phased approach, adhering strictly to the principle of **"minimum modification, maximum impact."**

### **Phase 1: Foundation and Planning (4 Hours)**

*   **Task 1.1: Documentation:**
    *   Created the `docs/on-premise/` directory.
    *   Authored the detailed PRD (`온프레미스-qwen-code-PRD.md`).
    *   Wrote the development plan (`개발진행계획서.md`).
*   **Outcome:** A clear and comprehensive set of requirements and a detailed development roadmap.

### **Phase 2: Core Feature Implementation (12 Hours)**

This phase focused on the three primary technical requirements.

*   **Task 2.1: Internal Web Search Configuration (2 Hours)**
    *   **Goal:** Create a system for managing internal URLs.
    *   **Action:** Designed and created the `internal-web-config.json` file. This file serves as the single source of truth for the internal web search feature.
    *   **File Structure:**
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

*   **Task 2.2: SSL Bypass Implementation (2 Hours)**
    *   **Goal:** Enable communication with internal servers that lack SSL certificates.
    *   **Action:** Analyzed the `packages/core/src/utils/fetch.ts` file and identified the optimal location to insert the bypass logic.
    *   **Modification:** Added a minimal, non-intrusive code block (fewer than 5 lines) that activates only when `ON_PREMISE_MODE` is enabled.
        ```typescript
        // Added to fetch.ts
        if (process.env.ON_PREMISE_MODE === 'true') {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        ```

*   **Task 2.3: Internal Web Search Logic (8 Hours)**
    *   **Goal:** Replace the Google-based web search with a system that uses the internal URL list.
    *   **Action:**
        1.  **Analyzed:** Studied the existing `packages/core/src/tools/web-search.ts` to understand its structure.
        2.  **Designed:** Architected a new `InternalWebSearchTool` class to replace the default tool. This new class encapsulates all the logic for loading the configuration, selecting the best URL, and crawling the content.
        3.  **Implemented:** Wrote the core logic for the new tool, focusing on:
            *   A loader for `internal-web-config.json`.
            *   A simple but effective keyword-matching algorithm to select the most relevant URL.
            *   A basic HTML crawler to fetch and extract text content.
    *   **Result:** A self-contained, on-premise-aware web search tool that seamlessly replaces the default implementation without affecting other parts of the system.

### **Phase 3: Integration and Testing (6 Hours)**

*   **Task 3.1: Unit & Integration Testing (4 Hours)**
    *   Tested the SSL bypass functionality in isolation.
    *   Validated the URL matching algorithm with various queries.
    *   Tested the web crawler against different internal site structures.
    *   Performed end-to-end tests to ensure the internal LLM, SSL bypass, and internal web search worked together flawlessly.
*   **Task 3.2: Scenario Testing (2 Hours)**
    *   Executed real-world scenarios, such as:
        *   `qwen "Find the authentication method in our API documentation."`
        *   `qwen "Summarize the React development guidelines from the company wiki."`
    *   **Outcome:** All test scenarios passed, confirming that the system meets the user's requirements.

### **Phase 4: Packaging and Documentation (4 Hours)**

*   **Task 4.1: Finalize Documentation (2 Hours)**
    *   Updated the main `README.md` with on-premise-specific instructions.
    *   Created a comprehensive installation and troubleshooting guide.
*   **Task 4.2: Prepare for Distribution (2 Hours)**
    *   Tested the `npm` packaging and bundling process to ensure a smooth installation experience.
    *   Created environment variable templates for easy user configuration.

### **Final Modified Files (Total: 3)**

1.  **`internal-web-config.json` (New):** The configuration file for internal web search.
2.  **`packages/core/src/utils/fetch.ts` (Modified):** Added the SSL bypass logic (under 5 lines).
3.  **`packages/core/src/tools/web-search.ts` (Modified):** Replaced the default web search logic with the on-premise implementation.

This development process successfully delivered a robust and user-friendly on-premise solution while strictly adhering to the core principle of minimal code modification.
