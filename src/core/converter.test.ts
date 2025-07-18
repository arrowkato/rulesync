import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import * as copilotParser from "../parsers/copilot.js";
import * as cursorParser from "../parsers/cursor.js";
import type { ParsedRule } from "../types/index.js";
import { convertToolConfigurations } from "./converter.js";
import * as generator from "./generator.js";

// Mock dependencies
vi.mock("./generator.js");
vi.mock("../parsers/cursor.js");
vi.mock("../parsers/copilot.js");
vi.mock("../utils/config.js", () => ({
  getDefaultConfig: () => ({
    defaultTargets: ["copilot", "cursor"],
    outputPaths: {
      copilot: ".github/copilot-instructions.md",
      cursor: ".cursorrules",
    },
  }),
}));

const mockGenerateConfigurations = generator.generateConfigurations as MockedFunction<
  typeof generator.generateConfigurations
>;
const mockParseCursorConfiguration = cursorParser.parseCursorConfiguration as MockedFunction<
  typeof cursorParser.parseCursorConfiguration
>;
const mockParseCopilotConfiguration = copilotParser.parseCopilotConfiguration as MockedFunction<
  typeof copilotParser.parseCopilotConfiguration
>;

describe("convertToolConfigurations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert cursor to copilot successfully", async () => {
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["cursor"],
          description: "Cursor rule",
          globs: ["**/*.ts"],
          cursorRuleType: "specificFiles",
        },
        content: "TypeScript rules for Cursor",
        filename: "cursor-typescript",
        filepath: "/cursor/.cursor/rules/typescript.mdc",
      },
    ];

    const mockOutputs = [
      {
        tool: "copilot" as const,
        filepath: "/project/.github/copilot-instructions.md",
        content: "Generated Copilot instructions",
      },
    ];

    mockParseCursorConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
    });

    mockGenerateConfigurations.mockResolvedValue(mockOutputs);

    const result = await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot"],
      baseDir: "/project",
    });

    expect(result.sourceRules).toEqual(mockSourceRules);
    expect(result.outputs).toEqual(mockOutputs);
    expect(result.errors).toEqual([]);
    expect(result.warnings[0]).toContain("Cursor rule types");

    // Verify the rule was transformed
    expect(mockGenerateConfigurations).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          frontmatter: expect.objectContaining({
            targets: ["*"], // Should be transformed from ["cursor"] to ["*"]
            description: expect.stringContaining("[Converted from Cursor specificFiles rule]"),
          }),
        }),
      ]),
      expect.any(Object),
      ["copilot"],
      "/project",
    );
  });

  it("should handle multiple target tools", async () => {
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["cursor"],
          description: "Multi-target rule",
          globs: [],
        },
        content: "Rule content",
        filename: "multi-rule",
        filepath: "/cursor/.cursorrules",
      },
    ];

    const mockOutputs = [
      {
        tool: "copilot" as const,
        filepath: "/project/.github/copilot-instructions.md",
        content: "Copilot content",
      },
      {
        tool: "claudecode" as const,
        filepath: "/project/CLAUDE.md",
        content: "Claude content",
      },
    ];

    mockParseCursorConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
    });

    mockGenerateConfigurations.mockResolvedValue(mockOutputs);

    const result = await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot", "claudecode"],
      baseDir: "/project",
    });

    expect(result.outputs).toHaveLength(2);
    expect(result.warnings).toHaveLength(3); // Two warnings for copilot, one for claudecode
  });

  it("should handle parser errors", async () => {
    mockParseCursorConfiguration.mockResolvedValue({
      rules: [],
      errors: ["Failed to parse .cursorrules", "No configuration found"],
    });

    const result = await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot"],
      baseDir: "/project",
    });

    expect(result.errors).toContain("Failed to parse .cursorrules");
    expect(result.errors).toContain("No configuration found");
    expect(result.errors).toContain("No configuration found for cursor in /project");
    expect(result.outputs).toEqual([]);
  });

  it("should handle generation failures", async () => {
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["cursor"],
          description: "Test rule",
          globs: [],
        },
        content: "Content",
        filename: "test",
        filepath: "/test.md",
      },
    ];

    mockParseCursorConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
    });

    mockGenerateConfigurations.mockRejectedValue(new Error("Generation failed"));

    const result = await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot"],
      baseDir: "/project",
    });

    expect(result.errors).toContain("Conversion failed: Generation failed");
  });

  it("should handle copilot to cursor conversion", async () => {
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["copilot"],
          description: "Copilot rule",
          globs: ["**/*.py"],
        },
        content: "Python rules for Copilot",
        filename: "copilot-python",
        filepath: "/project/.github/copilot-instructions.md",
      },
    ];

    mockParseCopilotConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
    });

    mockGenerateConfigurations.mockResolvedValue([
      {
        tool: "cursor" as const,
        filepath: "/project/.cursorrules",
        content: "Generated Cursor rules",
      },
    ]);

    const result = await convertToolConfigurations({
      sourceTool: "copilot",
      targetTools: ["cursor"],
      baseDir: "/project",
    });

    expect(result.sourceRules).toEqual(mockSourceRules);
    expect(result.warnings[0]).toContain("GitHub Copilot instructions");
  });

  it("should handle MCP compatibility warnings", async () => {
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["cursor"],
          description: "Rule with MCP",
          globs: [],
        },
        content: "Content",
        filename: "test",
        filepath: "/test.md",
      },
    ];

    mockParseCursorConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
      mcpServers: {
        "test-server": {
          command: "test",
          args: [],
        },
      },
    });

    mockGenerateConfigurations.mockResolvedValue([
      {
        tool: "copilot" as const,
        filepath: "/project/.github/copilot-instructions.md",
        content: "Generated content",
      },
    ]);

    const result = await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot"],
      baseDir: "/project",
    });

    expect(result.warnings[1]).toContain("MCP server configurations");
  });

  it("should preserve rule content during transformation", async () => {
    const originalContent = "Original rule content with specific instructions";
    const mockSourceRules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["cursor"],
          description: "Original description",
          globs: ["**/*.js"],
        },
        content: originalContent,
        filename: "test-rule",
        filepath: "/test.md",
      },
    ];

    mockParseCursorConfiguration.mockResolvedValue({
      rules: mockSourceRules,
      errors: [],
    });

    mockGenerateConfigurations.mockResolvedValue([]);

    await convertToolConfigurations({
      sourceTool: "cursor",
      targetTools: ["copilot"],
      baseDir: "/project",
    });

    // Verify that the content is preserved in the generated rules
    expect(mockGenerateConfigurations).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: originalContent, // Content should be unchanged
        }),
      ]),
      expect.any(Object),
      ["copilot"],
      "/project",
    );
  });
});
