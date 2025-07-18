# Project Structure

## Source Code Organization

```
src/
├── cli/                    # Command-line interface
│   ├── commands/          # Individual CLI commands (init, generate, import, etc.)
│   └── index.ts          # Main CLI entry point with Commander.js setup
├── core/                  # Core business logic
│   ├── generator.ts      # Main rule generation orchestrator
│   ├── parser.ts         # Rule file parsing logic
│   ├── validator.ts      # Rule validation logic
│   ├── importer.ts       # Configuration import logic
│   └── mcp-*.ts         # MCP server configuration handling
├── generators/           # Tool-specific generators
│   ├── rules/           # Rule file generators for each AI tool
│   └── mcp/             # MCP configuration generators
├── parsers/             # Tool-specific configuration parsers
├── types/               # TypeScript type definitions
├── utils/               # Shared utilities
└── test-utils/          # Testing utilities and mocks
```

## Configuration Structure

### AI Tool Configurations
Each AI tool has its own configuration directory structure:
- `.cursor/` - Cursor IDE rules and MCP config
- `.cline/` - Cline rules and MCP config  
- `.claude/` - Claude Code memories and commands
- `.roo/` - Roo Code rules and MCP config
- `.gemini/` - Gemini CLI memories and settings
- `.github/` - GitHub Copilot instructions
- `.kiro/` - Kiro IDE steering documents

### Core Files
- `.rulesync/` - Source rule definitions (Markdown with YAML frontmatter)
- `.rulesyncignore` - Files to exclude from processing
- `.mcp.json` - Root MCP server configuration

## Naming Conventions

### Files & Directories
- **Kebab-case** for file and directory names (`mcp-generator.ts`, `tool-targets.ts`)
- **PascalCase** for TypeScript interfaces and types
- **camelCase** for variables and functions
- **SCREAMING_SNAKE_CASE** for constants

### Code Organization
- Each AI tool has dedicated modules in `generators/`, `parsers/`, and `types/`
- Tool-specific logic is isolated and follows consistent patterns
- Shared utilities are centralized in `utils/`
- Test files use `.test.ts` suffix and mirror source structure

## Key Architectural Principles

### Separation of Concerns
- **CLI Layer**: Command parsing and user interaction
- **Core Layer**: Business logic and orchestration  
- **Generator Layer**: Tool-specific file generation
- **Parser Layer**: Tool-specific configuration parsing
- **Type Layer**: Schema definitions and validation

### Plugin Pattern
Each AI tool follows a consistent interface:
- Generator function for creating configurations
- Parser function for importing existing configurations
- Type definitions for tool-specific schemas
- Test coverage for both generation and parsing

### File Processing Pipeline
1. **Parse** rule files from `.rulesync/` directory
2. **Validate** against Zod schemas
3. **Generate** tool-specific configurations
4. **Write** to appropriate output directories
5. **Watch** for changes (optional)