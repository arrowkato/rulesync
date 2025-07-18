# Security and Quality Standards

## Security Best Practices
- **Secret Management**: Use secretlint for preventing secrets in commits
- **Dependency Security**: Regular security audits with npm audit
- **Type Safety**: Enable strict TypeScript settings (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Input Validation**: Validate all user inputs and file contents
- **Path Traversal Protection**: Prevent dangerous path operations

## Code Quality
- **Linting**: Use Biome for consistent code formatting and linting
- **Testing**: Comprehensive test coverage with Vitest
- **Type Checking**: Strict TypeScript compilation with zero errors
- **Documentation**: Maintain clear API documentation and examples

## Git Hooks and CI
- **Pre-commit Hooks**: Run tests, linting, formatting, and security checks
- **Atomic Operations**: Use atomic file operations to prevent corruption
- **Error Handling**: Provide meaningful error messages with solutions
- **Performance**: Profile critical paths and optimize for performance

## Dependencies
- **Minimal Dependencies**: Only include necessary packages
- **Security Updates**: Keep dependencies up-to-date
- **Lock Files**: Use lock files for reproducible builds
- **Vulnerability Scanning**: Regular dependency security scanning