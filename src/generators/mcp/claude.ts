import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";
import { shouldIncludeServer } from "../../utils/mcp-helpers.js";

interface ClaudeSettings {
  mcpServers?: Record<string, ClaudeServer>;
}

interface ClaudeServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  transport?: "sse" | "http";
}

export function generateClaudeMcp(
  config: RulesyncMcpConfig,
  _target: "global" | "project",
): string {
  const claudeSettings: ClaudeSettings = {
    mcpServers: {},
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    return shouldIncludeServer(server, "claude");
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;

    const claudeServer: ClaudeServer = {};

    if (server.command) {
      claudeServer.command = server.command;
      if (server.args) claudeServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        claudeServer.url = url;
      }
      if (server.httpUrl) {
        claudeServer.transport = "http";
      } else if (server.transport === "sse") {
        claudeServer.transport = "sse";
      }
    }

    if (server.env) {
      claudeServer.env = server.env;
    }

    claudeSettings.mcpServers![serverName] = claudeServer;
  }

  return JSON.stringify(claudeSettings, null, 2);
}

export function generateClaudeMcpConfiguration(
  mcpServers: Record<string, RulesyncMcpServer>,
  baseDir: string = "",
): Array<{ filepath: string; content: string }> {
  const filepath = baseDir ? `${baseDir}/.claude/settings.json` : ".claude/settings.json";

  const settings: ClaudeSettings = {
    mcpServers: {},
  };

  for (const [serverName, server] of Object.entries(mcpServers)) {
    // Check if this server should be included for claude
    if (!shouldIncludeServer(server, "claudecode")) {
      continue;
    }

    // Clone server config and remove targets
    const { targets: _, transport, ...serverConfig } = server;
    // Convert to ClaudeServer format
    const claudeServer: ClaudeServer = {
      ...serverConfig,
    };

    // Only add transport if it's supported by Claude
    if (transport && transport !== "stdio") {
      claudeServer.transport = transport as "sse" | "http";
    }

    settings.mcpServers![serverName] = claudeServer;
  }

  return [
    {
      filepath,
      content: `${JSON.stringify(settings, null, 2)}\n`,
    },
  ];
}
