import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { repoMapper } from "./repoMapper";

interface Vulnerability {
  package?: string;
  version?: string;
  severity?: string | any[];
  component?: string;
  issue?: string;
  recommendation?: string;
  fix_command?: string;
  cve_id?: string;
}

export async function securityAgent(repoUrl: string): Promise<Vulnerability[]> {
  const { files } = await repoMapper(repoUrl);
  const vulnerabilities: Vulnerability[] = [];

  // Find package.json if exists
  const pkgFile = files.find(f => f.path.endsWith("package.json"));
  if (!pkgFile) return vulnerabilities;

  let pkg: any = {};
  try { pkg = JSON.parse(fs.readFileSync(pkgFile.path, "utf-8")); } catch { }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Query OSV.dev API for each dependency
  for (const [name, version] of Object.entries(deps)) {
    try {
      const res = await fetch("https://api.osv.dev/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: { name, ecosystem: "npm" }, version })
      });
      const data = await res.json();

      if (data.vulns && data.vulns.length) {
        data.vulns.forEach((v: any) => {
          vulnerabilities.push({
            package: name,
            version,
            severity: v.cvss ? v.cvss : "medium",
            recommendation: "Upgrade",
            fix_command: `npm i ${name}@latest`,
            cve_id: v.id
          });
        });
      }
    } catch (err) {
      console.error("OSV query failed for", name, err);
    }
  }

  // Optional: GitHub Security Advisories can be added similarly
  // vulnerabilities.push(...githubSecurityData);

  return vulnerabilities;
}
