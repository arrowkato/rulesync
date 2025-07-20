# Product Overview

rulesync is a Node.js CLI tool that unifies AI development tool configuration management. It allows teams to define AI coding rules once in a centralized format (`.rulesync/*.md`) and automatically generate tool-specific configuration files for various AI development assistants.

## Core Value Proposition

- **Tool Flexibility**: Team members can use different AI tools (GitHub Copilot, Cursor, Cline, Claude Code, etc.) while maintaining consistent coding standards
- **Future-Proof Development**: Easy migration between AI tools without redefining rules from scratch
- **No Vendor Lock-in**: Generated configuration files can be used independently of rulesync
- **Multi-Tool Workflows**: Enable hybrid development combining multiple AI assistants

## Supported AI Tools

The tool supports both rule generation and configuration import for:
- GitHub Copilot Custom Instructions
- Cursor Project Rules  
- Cline Rules
- Claude Code Memory
- Roo Code Rules
- Gemini CLI
- Kiro IDE Custom Steering Documents

## Key Features

- Unified rule definition in Markdown with YAML frontmatter
- Bidirectional sync (import existing configs, generate new ones)
- MCP (Model Context Protocol) server configuration management
- File watching and auto-generation
- Monorepo support with multiple base directories
- Validation and status checking