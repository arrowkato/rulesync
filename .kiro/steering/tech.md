# Technology Stack

## Runtime & Language
- **Node.js**: >=20.0.0 (specified in package.json engines)
- **TypeScript**: 5.8.3 with strict configuration
- **Package Manager**: pnpm 10.12.2

## Build System & Tooling
- **Build**: tsup for bundling (CJS + ESM + DTS output)
- **Development**: tsx for running TypeScript directly
- **Testing**: Vitest with coverage via v8
- **Linting**: Multi-layer approach with Biome, ESLint, and Oxlint
- **Formatting**: Biome (2 spaces, semicolons, double quotes, trailing commas)

## Key Dependencies
- **CLI Framework**: Commander.js for command-line interface
- **File Processing**: 
  - chokidar for file watching
  - gray-matter for frontmatter parsing
  - marked for Markdown processing
  - micromatch for glob patterns
- **Validation**: Zod for schema validation
- **YAML**: js-yaml for YAML processing

## Common Commands

### Development
```bash
pnpm dev <command>          # Run CLI in development mode
pnpm dev generate           # Generate configs in dev mode
pnpm test                   # Run tests
pnpm test:watch            # Run tests in watch mode
pnpm test:coverage         # Run tests with coverage
```

### Code Quality
```bash
pnpm check                 # Run all linters and type checking
pnpm fix                   # Auto-fix all linting issues
pnpm bcheck                # Biome check
pnpm oxlint                # Oxlint check
pnpm eslint                # ESLint check
pnpm typecheck             # TypeScript type checking
```

### Build & Release
```bash
pnpm build                 # Build for production
pnpm generate              # Generate rule configurations
pnpm prepublishOnly        # Pre-publish build hook
```

## Architecture Patterns
- **Modular Design**: Separate generators, parsers, and validators for each AI tool
- **Plugin Architecture**: Each AI tool has dedicated generator/parser modules
- **Schema-First**: Zod schemas for type safety and validation
- **Functional Approach**: Pure functions for core logic with minimal side effects