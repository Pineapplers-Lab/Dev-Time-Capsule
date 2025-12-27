// src/agents/semanticsAgent.ts
import fs from "fs";
import path from "path";

export async function semanticsAgent(repoPath: string) {
  const functions: { name: string; file: string }[] = [];
  
  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const matches = content.matchAll(/function\s+(\w+)/g);
        for (const m of matches) functions.push({ name: m[1], file: fullPath.replace(repoPath + path.sep, "") });
      }
    }
  };

  walk(repoPath);
  return functions;
}
