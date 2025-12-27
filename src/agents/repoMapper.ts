// src/agents/repoMapper.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function repoMapper(repoUrl: string) {
  const repoPath = path.join(process.cwd(), "tmp_repo");

  // Clean previous clone
  if (fs.existsSync(repoPath)) fs.rmSync(repoPath, { recursive: true, force: true });

  // Clone repo safely
  await new Promise<void>((resolve, reject) => {
    exec(`git clone "${repoUrl}" tmp_repo --depth 1`, (err, stdout, stderr) => {
      if (err) {
        console.error("repoMapper clone error:", stderr);
        return reject(new Error(stderr));
      }
      resolve();
    });
  });

  // Walk directory safely
  const files: { path: string }[] = [];
  const walk = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath);
        else files.push({ path: fullPath.replace(repoPath + path.sep, "") });
      }
    } catch (err) {
      console.warn("Skipping unreadable path:", dir);
    }
  };
  walk(repoPath);

  return { tech_stack: [], files, repoPath };
}
