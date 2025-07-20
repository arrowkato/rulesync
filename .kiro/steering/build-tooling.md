# Build and Tooling Standards

## TypeScript Configuration
- Use `@tsconfig/node24` as base configuration
- Enable strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Generate declaration files and source maps
- Target Node.js 20+ for modern features

## Build Tool (tsup)
- Generate both ESM and CommonJS outputs for maximum compatibility
- Include TypeScript declarations (`.d.ts`, `.d.mts`)
- Clean output directory before each build
- Use `--dts` flag for declaration generation

## Package Manager (pnpm)
- Use pnpm for faster installs and better dependency resolution
- Specify exact package manager version in `packageManager` field
- Use `pnpm-lock.yaml` for reproducible builds
- Leverage workspaces for monorepo setups

## Performance Optimization
- Use native Node.js APIs when possible
- Minimize dependencies and bundle size
- Implement lazy loading for heavy operations
- Profile and optimize critical paths
EOF < /dev/null