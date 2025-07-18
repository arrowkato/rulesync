import {
  parseClaudeConfiguration,
  parseClineConfiguration,
  parseCopilotConfiguration,
  parseCursorConfiguration,
  parseGeminiConfiguration,
  parseRooConfiguration,
} from "../parsers/index.js";
import type { GeneratedOutput, ParsedRule } from "../types/index.js";
import type { ToolTarget } from "../types/tool-targets.js";
import { getDefaultConfig } from "../utils/config.js";
import { generateConfigurations } from "./generator.js";

export interface ConversionRequest {
  sourceTool: ToolTarget;
  targetTools: ToolTarget[];
  baseDir: string;
}

export interface ConversionResult {
  sourceRules: ParsedRule[];
  outputs: GeneratedOutput[];
  errors: string[];
  warnings: string[];
}

export interface ConversionError {
  type: "validation" | "parse" | "generation" | "filesystem";
  tool?: ToolTarget;
  file?: string;
  message: string;
  suggestion?: string;
}

type ToolParser = (baseDir: string) => Promise<{
  rules: ParsedRule[];
  errors: string[];
  ignorePatterns?: string[];
  mcpServers?: Record<string, unknown>;
}>;

const TOOL_PARSERS: Record<ToolTarget, ToolParser> = {
  cursor: parseCursorConfiguration,
  copilot: parseCopilotConfiguration,
  cline: parseClineConfiguration,
  claudecode: parseClaudeConfiguration,
  roo: parseRooConfiguration,
  geminicli: parseGeminiConfiguration,
  kiro: async () => ({ rules: [], errors: ["Kiro parser not implemented for conversion"] }),
};

/**
 * Convert tool configurations from source tool to target tools
 */
export async function convertToolConfigurations(
  request: ConversionRequest,
): Promise<ConversionResult> {
  const result: ConversionResult = {
    sourceRules: [],
    outputs: [],
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Parse source tool configuration
    const parser = TOOL_PARSERS[request.sourceTool];
    if (!parser) {
      result.errors.push(`No parser available for source tool: ${request.sourceTool}`);
      return result;
    }

    const parseResult = await parser(request.baseDir);

    if (parseResult.errors.length > 0) {
      result.errors.push(...parseResult.errors);
    }

    if (parseResult.rules.length === 0) {
      result.errors.push(`No configuration found for ${request.sourceTool} in ${request.baseDir}`);
      return result;
    }

    result.sourceRules = parseResult.rules;

    // Step 2: Transform rules for target tools
    const transformedRules = await transformRulesForTargets(
      parseResult.rules,
      request.sourceTool,
      request.targetTools,
    );

    // Step 3: Generate configurations for target tools
    const config = getDefaultConfig();
    const outputs = await generateConfigurations(
      transformedRules,
      config,
      request.targetTools,
      request.baseDir,
    );

    result.outputs = outputs;

    // Add warnings for unsupported features
    for (const targetTool of request.targetTools) {
      const compatibility = validateToolCompatibility(request.sourceTool, targetTool);
      if (compatibility.warnings.length > 0) {
        result.warnings.push(
          ...compatibility.warnings.map((w) => `${request.sourceTool} → ${targetTool}: ${w}`),
        );
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(`Conversion failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Transform rules to be compatible with target tools
 */
async function transformRulesForTargets(
  rules: ParsedRule[],
  sourceTool: ToolTarget,
  _targetTools: ToolTarget[],
): Promise<ParsedRule[]> {
  return rules.map((rule) => {
    // Create a copy of the rule to avoid mutating the original
    const transformedRule: ParsedRule = {
      ...rule,
      frontmatter: { ...rule.frontmatter },
    };

    // Normalize targets for conversion
    // Convert source-specific targets to wildcard for broad compatibility
    if (
      Array.isArray(transformedRule.frontmatter.targets) &&
      transformedRule.frontmatter.targets.some((target) => target === sourceTool)
    ) {
      transformedRule.frontmatter.targets = ["*"];
    }

    // Handle Cursor-specific metadata
    if (sourceTool === "cursor" && transformedRule.frontmatter.cursorRuleType) {
      // Add a note about the original Cursor rule type in the description
      const ruleTypeNote = `[Converted from Cursor ${transformedRule.frontmatter.cursorRuleType} rule]`;
      if (transformedRule.frontmatter.description) {
        transformedRule.frontmatter.description = `${transformedRule.frontmatter.description}\n\n${ruleTypeNote}`;
      } else {
        transformedRule.frontmatter.description = ruleTypeNote;
      }
    }

    return transformedRule;
  });
}

/**
 * Validate compatibility between source and target tools
 */
function validateToolCompatibility(
  sourceTool: ToolTarget,
  targetTool: ToolTarget,
): {
  warnings: string[];
  isCompatible: boolean;
} {
  const warnings: string[] = [];
  const isCompatible = true;

  // Tool-specific compatibility checks
  if (sourceTool === "cursor") {
    switch (targetTool) {
      case "copilot":
        warnings.push(
          "Cursor rule types (always/manual/specificFiles/intelligently) will be noted in descriptions",
        );
        break;
      case "claudecode":
        warnings.push("Cursor .mdc files will be converted to standard markdown format");
        break;
      case "cline":
        warnings.push("Cursor ignore patterns may not translate directly to Cline format");
        break;
    }
  }

  if (sourceTool === "copilot") {
    switch (targetTool) {
      case "cursor":
        warnings.push("GitHub Copilot instructions will be converted to Cursor rules format");
        break;
      case "claudecode":
        warnings.push("Copilot-specific formatting may need manual adjustment for Claude Code");
        break;
    }
  }

  // MCP server configurations
  if (
    ["cursor", "claudecode", "cline"].includes(sourceTool) &&
    !["cursor", "claudecode", "cline"].includes(targetTool)
  ) {
    warnings.push("MCP server configurations are not supported in the target tool");
  }

  return { warnings, isCompatible };
}
