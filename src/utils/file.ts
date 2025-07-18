import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await stat(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function readFileContent(filepath: string): Promise<string> {
  return readFile(filepath, "utf-8");
}

export async function writeFileContent(filepath: string, content: string): Promise<void> {
  await ensureDir(dirname(filepath));
  await writeFile(filepath, content, "utf-8");
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await stat(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function findFiles(dir: string, extension: string = ".md"): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter((file) => file.endsWith(extension)).map((file) => join(dir, file));
  } catch {
    return [];
  }
}

export async function removeDirectory(dirPath: string): Promise<void> {
  // Safety check: prevent deletion of dangerous paths
  const dangerousPaths = [".", "/", "~", "src", "node_modules"];
  if (dangerousPaths.includes(dirPath) || dirPath === "") {
    console.warn(`Skipping deletion of dangerous path: ${dirPath}`);
    return;
  }

  try {
    if (await fileExists(dirPath)) {
      await rm(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`Failed to remove directory ${dirPath}:`, error);
  }
}

export async function removeFile(filepath: string): Promise<void> {
  try {
    if (await fileExists(filepath)) {
      await rm(filepath);
    }
  } catch (error) {
    console.warn(`Failed to remove file ${filepath}:`, error);
  }
}

export async function removeClaudeGeneratedFiles(): Promise<void> {
  const filesToRemove = ["CLAUDE.md", ".claude/memories"];

  for (const fileOrDir of filesToRemove) {
    if (fileOrDir.endsWith("/memories")) {
      // Remove the entire memories directory
      await removeDirectory(fileOrDir);
    } else {
      // Remove individual file
      await removeFile(fileOrDir);
    }
  }
}
