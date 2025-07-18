# CLI Development Standards

## Commander.js Usage
- Each command placed in individual file in `src/cli/commands/`
- Command names use lowercase kebab-case
- Provide both short and long forms for options (e.g., `-o, --output`)
- Minimize required options, obtain defaults from config

## Error Handling & Exit Codes
- Success: 0
- General error: 1
- Configuration error: 2
- File I/O error: 3

## User Experience
- Use user-friendly error messages with solution suggestions
- Show progress for long-running processes
- Use emoji and colors for better UX (✅ ❌ ⚠️ 📁 🎯)
- Support verbose mode with `--verbose` flag

## Modern CLI Features
- Support monorepo workflows with `--base-dir` option
- File watching capabilities with `chokidar`
- Atomic file operations to prevent corruption
- Auto-completion friendly command structure
EOF < /dev/null