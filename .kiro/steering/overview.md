# rulesync Project Overview

rulesync is a unified AI configuration management CLI tool that supports multiple AI development tools (GitHub Copilot, Cursor, Cline, Claude Code, Roo Code).

## Core Architecture

### Main Components
- **CLI Entry Point**: `src/cli/index.ts` - Uses Commander.js with comprehensive commands
- **Core Parsing**: `src/core/parser.ts` - Frontmatter processing with gray-matter
- **Generation Engine**: `src/core/generator.ts` - Orchestrates tool-specific configuration file generation
- **Tool-Specific Generators**: `src/generators/` - Markdown generation for each AI tool
- **Validation System**: `src/core/validator.ts` - Rules validation and error reporting
- **File Utilities**: `src/utils/file.ts` - Safe file operations with atomic updates

### Design Patterns
- **TypeScript strict mode**: Enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- **Dual ESM/CJS output**: Generate dist/index.js (CJS) and dist/index.mjs (ESM) with tsup
- **Functional approach**: Prioritize pure functions and minimize side effects
- **Error handling**: Emphasize specific error messages and type safety
- **Command pattern**: Each CLI command as separate module with comprehensive testing

### Key Features
- **Monorepo Support**: Base directory option (`--base-dir`) for generating configs in multiple locations
- **Hot Reloading**: File watching with automatic regeneration
- **Comprehensive Validation**: Frontmatter and content validation with helpful error messages
- **Multiple Output Formats**: Support for 7 different AI tool configuration formats
- **Safety First**: Dangerous path protection and atomic file operations

### Input Data Structure
```typescript
type RuleFrontmatter = {
  root: boolean;           // Whether it's root level
  targets: ["*"] | ToolTarget[]; // Target tool specification
  description: string;     // Concise rule description
  globs: string[];        // File patterns to apply
}

type ToolTarget = "copilot" | "cursor" | "cline" | "claudecode" | "claude" | "roo" | "geminicli";
```

### CLI Commands
- `init`: Initialize project with sample rules
- `add <filename>`: Add new rule file with template
- `generate`: Generate all tool configurations
- `validate`: Validate rule files and configuration
- `status`: Show current project status
- `watch`: Watch for changes and auto-regenerate
- `gitignore`: Add generated files to .gitignore