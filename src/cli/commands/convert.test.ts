import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import type { ConversionResult } from "../../core/converter.js";
import * as converter from "../../core/converter.js";
import { convertCommand } from "./convert.js";

// Mock the converter module
vi.mock("../../core/converter.js");

const mockConvertToolConfigurations = converter.convertToolConfigurations as MockedFunction<
  typeof converter.convertToolConfigurations
>;

// Mock console methods
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
const _mockProcessExit = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`Process exit called with code ${code}`);
});

describe("convertCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation", () => {
    it("should reject invalid source tool", async () => {
      await expect(
        convertCommand({
          from: "invalid",
          to: "copilot",
        }),
      ).rejects.toThrow("Process exit called with code 1");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Invalid source tool: invalid");
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("Available source tools:"),
      );
    });

    it("should reject invalid target tool", async () => {
      await expect(
        convertCommand({
          from: "cursor",
          to: "invalid",
        }),
      ).rejects.toThrow("Process exit called with code 1");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Invalid target tool: invalid");
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("Available target tools:"),
      );
    });

    it("should reject converting to the same tool", async () => {
      await expect(
        convertCommand({
          from: "cursor",
          to: "cursor",
        }),
      ).rejects.toThrow("Process exit called with code 1");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Cannot convert from cursor to itself");
    });

    it("should handle multiple target tools with one invalid", async () => {
      await expect(
        convertCommand({
          from: "cursor",
          to: "copilot,invalid,claudecode",
        }),
      ).rejects.toThrow("Process exit called with code 1");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Invalid target tool: invalid");
    });
  });

  describe("successful conversion", () => {
    it("should convert single tool successfully", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [
          {
            frontmatter: { root: false, targets: ["*"], description: "Test rule", globs: [] },
            content: "Test content",
            filename: "test",
            filepath: "/test.md",
          },
        ],
        outputs: [
          {
            tool: "copilot",
            filepath: "/output/copilot.md",
            content: "Generated content",
          },
        ],
        errors: [],
        warnings: [],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot",
      });

      expect(mockConvertToolConfigurations).toHaveBeenCalledWith({
        sourceTool: "cursor",
        targetTools: ["copilot"],
        baseDir: process.cwd(),
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "✅ Successfully converted 1 rule(s) from cursor",
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "✅ Generated copilot configuration: /output/copilot.md",
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "\n🎉 Conversion complete! Generated 1 configuration file(s).",
      );
    });

    it("should convert multiple tools successfully", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [
          {
            frontmatter: { root: false, targets: ["*"], description: "Test rule", globs: [] },
            content: "Test content",
            filename: "test",
            filepath: "/test.md",
          },
        ],
        outputs: [
          {
            tool: "copilot",
            filepath: "/output/copilot.md",
            content: "Generated content",
          },
          {
            tool: "claudecode",
            filepath: "/output/claude.md",
            content: "Generated content",
          },
        ],
        errors: [],
        warnings: [],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot,claudecode",
      });

      expect(mockConvertToolConfigurations).toHaveBeenCalledWith({
        sourceTool: "cursor",
        targetTools: ["copilot", "claudecode"],
        baseDir: process.cwd(),
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "✅ Successfully converted 1 rule(s) from cursor",
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "\n🎉 Conversion complete! Generated 2 configuration file(s).",
      );
    });

    it("should handle verbose mode", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [],
        outputs: [],
        errors: [],
        warnings: [],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot",
        verbose: true,
        baseDir: "/custom/path",
      });

      expect(mockConsoleLog).toHaveBeenCalledWith("Converting from cursor to copilot");
      expect(mockConsoleLog).toHaveBeenCalledWith("Base directory: /custom/path");
    });
  });

  describe("error handling", () => {
    it("should display conversion errors", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [],
        outputs: [],
        errors: ["Parse error", "Generation error"],
        warnings: [],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot",
      });

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Conversion completed with errors:");
      expect(mockConsoleError).toHaveBeenCalledWith("  Parse error");
      expect(mockConsoleError).toHaveBeenCalledWith("  Generation error");
    });

    it("should display conversion warnings", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [
          {
            frontmatter: { root: false, targets: ["*"], description: "Test rule", globs: [] },
            content: "Test content",
            filename: "test",
            filepath: "/test.md",
          },
        ],
        outputs: [
          {
            tool: "copilot",
            filepath: "/output/copilot.md",
            content: "Generated content",
          },
        ],
        errors: [],
        warnings: ["Compatibility warning"],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot",
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith("⚠️  Conversion completed with warnings:");
      expect(mockConsoleWarn).toHaveBeenCalledWith("  Compatibility warning");
    });

    it("should handle no configurations generated", async () => {
      const mockResult: ConversionResult = {
        sourceRules: [],
        outputs: [],
        errors: [],
        warnings: [],
      };

      mockConvertToolConfigurations.mockResolvedValue(mockResult);

      await convertCommand({
        from: "cursor",
        to: "copilot",
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith("⚠️  No configurations generated");
    });

    it("should handle conversion exceptions", async () => {
      mockConvertToolConfigurations.mockRejectedValue(new Error("Conversion failed"));

      await expect(
        convertCommand({
          from: "cursor",
          to: "copilot",
        }),
      ).rejects.toThrow("Process exit called with code 1");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Conversion failed: Conversion failed");
    });
  });
});
