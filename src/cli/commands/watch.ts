import chokidar from "chokidar";
import { generateCommand } from "./generate.js";
import { getDefaultConfig } from "../../utils/index.js";

export async function watchCommand(): Promise<void> {
  const config = getDefaultConfig();
  
  console.log("👀 Watching for changes in .ai-rules directory...");
  console.log("Press Ctrl+C to stop watching");
  
  // Initial generation
  await generateCommand({ verbose: false });
  
  // Watch for changes
  const watcher = chokidar.watch(`${config.aiRulesDir}/**/*.md`, {
    ignoreInitial: true,
    persistent: true,
  });
  
  let isGenerating = false;
  
  const handleChange = async (path: string) => {
    if (isGenerating) return;
    
    isGenerating = true;
    console.log(`\n📝 Detected change in ${path}`);
    
    try {
      await generateCommand({ verbose: false });
      console.log("✅ Regenerated configuration files");
    } catch (error) {
      console.error("❌ Failed to regenerate:", error);
    } finally {
      isGenerating = false;
    }
  };
  
  watcher
    .on("change", handleChange)
    .on("add", handleChange)
    .on("unlink", (path) => {
      console.log(`\n🗑️  Removed ${path}`);
      handleChange(path);
    })
    .on("error", (error) => {
      console.error("❌ Watcher error:", error);
    });
  
  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Stopping watcher...");
    watcher.close();
    process.exit(0);
  });
}