import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../../types/index.js";
import { fileExists, readFileContent, writeFileContent } from "../../utils/file.js";
import { loadIgnorePatterns } from "../../utils/ignore.js";

export async function generateClaudecodeConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string,
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Separate root and non-root rules
  const rootRules = rules.filter((r) => r.frontmatter.root === true);
  const detailRules = rules.filter((r) => r.frontmatter.root === false);

  // Generate CLAUDE.md with root rule and references to detail files
  const claudeMdContent = generateClaudeMarkdown(rootRules, detailRules);
  const claudeOutputDir = baseDir
    ? join(baseDir, config.outputPaths.claudecode)
    : config.outputPaths.claudecode;
  outputs.push({
    tool: "claudecode",
    filepath: join(claudeOutputDir, "CLAUDE.md"),
    content: claudeMdContent,
  });

  // Generate individual memory files for detail rules
  for (const rule of detailRules) {
    const memoryContent = generateMemoryFile(rule);
    outputs.push({
      tool: "claudecode",
      filepath: join(claudeOutputDir, ".claude", "memories", `${rule.filename}.md`),
      content: memoryContent,
    });
  }

  // Update .claude/settings.json with ignore patterns if .rulesyncignore exists
  const ignorePatterns = await loadIgnorePatterns(baseDir);
  if (ignorePatterns.patterns.length > 0) {
    const settingsPath = baseDir
      ? join(baseDir, ".claude", "settings.json")
      : join(".claude", "settings.json");

    await updateClaudeSettings(settingsPath, ignorePatterns.patterns);
  }

  return outputs;
}

function generateClaudeMarkdown(rootRules: ParsedRule[], detailRules: ParsedRule[]): string {
  const lines: string[] = [];

  // Add introductory text and references to memory files at the top
  if (detailRules.length > 0) {
    lines.push("Please also reference the following documents as needed:");
    lines.push("");
    lines.push("| Document | Description | File Patterns |");
    lines.push("|----------|-------------|---------------|");
    for (const rule of detailRules) {
      const globsText = rule.frontmatter.globs.length > 0 ? rule.frontmatter.globs.join(", ") : "-";
      lines.push(
        `| @.claude/memories/${rule.filename}.md | ${rule.frontmatter.description} | ${globsText} |`,
      );
    }
    lines.push("");
  }

  // Add root rules
  if (rootRules.length > 0) {
    for (const rule of rootRules) {
      lines.push(rule.content);
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateMemoryFile(rule: ParsedRule): string {
  return rule.content.trim();
}

async function updateClaudeSettings(settingsPath: string, ignorePatterns: string[]): Promise<void> {
  let settings: unknown = {};

  // Read existing settings if file exists
  if (await fileExists(settingsPath)) {
    try {
      const content = await readFileContent(settingsPath);
      settings = JSON.parse(content);
    } catch {
      console.warn(`Failed to parse existing ${settingsPath}, creating new settings`);
      settings = {};
    }
  }

  // Type guard to ensure settings is an object
  if (typeof settings !== "object" || settings === null) {
    settings = {};
  }

  // Cast to a more specific type for easier handling
  const settingsObj = settings as Record<string, unknown>;

  // Initialize permissions structure if not exists
  if (
    !settingsObj.permissions ||
    typeof settingsObj.permissions !== "object" ||
    settingsObj.permissions === null
  ) {
    settingsObj.permissions = {};
  }
  const permissions = settingsObj.permissions as Record<string, unknown>;

  if (!Array.isArray(permissions.deny)) {
    permissions.deny = [];
  }

  // Generate Read() rules for each ignore pattern
  const readDenyRules = ignorePatterns.map((pattern) => `Read(${pattern})`);

  const denyArray = permissions.deny as string[];

  // Remove existing Read() rules that were generated by rulesync
  const filteredDeny = denyArray.filter((rule) => {
    if (typeof rule !== "string") return false;

    // Keep non-Read rules and Read rules that don't match our patterns
    if (!rule.startsWith("Read(")) return true;

    // Extract pattern from Read(pattern)
    const match = rule.match(/^Read\((.*)\)$/);
    if (!match) return true;

    // Remove if it's one of our patterns
    return !ignorePatterns.includes(match[1] ?? "");
  });

  // Add new Read() rules
  filteredDeny.push(...readDenyRules);

  // Remove duplicates
  permissions.deny = [...new Set(filteredDeny)];

  // Write updated settings
  const jsonContent = JSON.stringify(settingsObj, null, 2);
  await writeFileContent(settingsPath, jsonContent);

  console.log(`✅ Updated Claude Code settings: ${settingsPath}`);
}
