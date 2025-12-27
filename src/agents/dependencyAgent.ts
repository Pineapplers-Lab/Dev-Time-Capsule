// src/agents/dependencyAgent.ts
export async function dependencyAgent(repoPath: string) {
  // Example: extract dependencies from package.json or requirements.txt
  const fs = require("fs");
  const path = require("path");

  const techStack: string[] = [];

  try {
    const pkgPath = path.join(repoPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.dependencies) techStack.push(...Object.keys(pkg.dependencies));
      if (pkg.devDependencies) techStack.push(...Object.keys(pkg.devDependencies));
    }
  } catch (err) {
    console.error("dependencyAgent error:", err);
  }

  return techStack;
}
