import { convertToolConfigurations } from "../../core/converter.js";
import type { ToolTarget } from "../../types/index.js";
import { ToolTargetSchema } from "../../types/tool-targets.js";

export interface ConvertOptions {
  from: string;
  to: string;
  baseDir?: string;
  verbose?: boolean;
}

export async function convertCommand(options: ConvertOptions): Promise<void> {
  try {
    // Validate source tool
    const sourceToolResult = ToolTargetSchema.safeParse(options.from);
    if (!sourceToolResult.success) {
      console.error(`❌ Invalid source tool: ${options.from}`);
      console.error(
        `Available source tools: copilot, cursor, cline, claudecode, roo, geminicli, kiro`,
      );
      process.exit(1);
    }
    const sourceTool = sourceToolResult.data;

    // Parse and validate target tools
    const targetToolStrings = options.to.split(",").map((tool) => tool.trim());
    const targetTools: ToolTarget[] = [];

    for (const toolStr of targetToolStrings) {
      const targetToolResult = ToolTargetSchema.safeParse(toolStr);
      if (!targetToolResult.success) {
        console.error(`❌ Invalid target tool: ${toolStr}`);
        console.error(
          `Available target tools: copilot, cursor, cline, claudecode, roo, geminicli, kiro`,
        );
        process.exit(1);
      }
      targetTools.push(targetToolResult.data);
    }

    // Prevent converting to the same tool
    if (targetTools.includes(sourceTool)) {
      console.error(`❌ Cannot convert from ${sourceTool} to itself`);
      process.exit(1);
    }

    const baseDir = options.baseDir || process.cwd();

    if (options.verbose) {
      console.log(`Converting from ${sourceTool} to ${targetTools.join(", ")}`);
      console.log(`Base directory: ${baseDir}`);
    }

    // Perform conversion
    const result = await convertToolConfigurations({
      sourceTool,
      targetTools,
      baseDir,
    });

    // Display results
    if (result.errors.length > 0) {
      console.error("❌ Conversion completed with errors:");
      for (const error of result.errors) {
        console.error(`  ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      console.warn("⚠️  Conversion completed with warnings:");
      for (const warning of result.warnings) {
        console.warn(`  ${warning}`);
      }
    }

    if (result.outputs.length === 0) {
      console.warn("⚠️  No configurations generated");
      return;
    }

    console.log(
      `✅ Successfully converted ${result.sourceRules.length} rule(s) from ${sourceTool}`,
    );
    for (const output of result.outputs) {
      console.log(`✅ Generated ${output.tool} configuration: ${output.filepath}`);
    }

    console.log(
      `\n🎉 Conversion complete! Generated ${result.outputs.length} configuration file(s).`,
    );
  } catch (error) {
    console.error(
      `❌ Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
