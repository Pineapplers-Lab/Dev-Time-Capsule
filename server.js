import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import tmp from "tmp-promise";
import util from "util";

const execAsync = util.promisify(exec);
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));

// Helper: Query OSV.dev for a package
async function queryOSV(packageName, ecosystem, version) {
  const res = await fetch("https://api.osv.dev/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { name: packageName, ecosystem },
      version,
    }),
  });
  const data = await res.json();
  return data.vulns || [];
}

// Helper: Run Semgrep on a directory
async function runSemgrep(dir) {
  const semgrepOut = path.join(dir, "semgrep.json");
  await execAsync(`semgrep scan --config auto --json --output ${semgrepOut}`, {
    cwd: dir,
  });
  const result = JSON.parse(fs.readFileSync(semgrepOut, "utf-8"));
  return result.results || [];
}

// Helper: Run CodeQL on a directory
async function runCodeQL(dir) {
  const dbPath = path.join(dir, "codeql-db");
  const sarifOut = path.join(dir, "codeql.json");

  await execAsync(`codeql database create ${dbPath} --language=javascript`, {
    cwd: dir,
  });
  await execAsync(
    `codeql database analyze ${dbPath} javascript-security-extended.qls --format=sarif-latest --output=${sarifOut}`,
    { cwd: dir }
  );

  const sarif = JSON.parse(fs.readFileSync(sarifOut, "utf-8"));
  return sarif.runs.flatMap((run) => run.results) || [];
}

// Aggregate OSV, Semgrep, and CodeQL results
async function scanRepo(repoUrl) {
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  const repoPath = tmpDir.path;

  // Clone repo
  await execAsync(`git clone --depth 1 ${repoUrl} ${repoPath}`);

  // Extract package info (example for npm)
  const packageJsonPath = path.join(repoPath, "package.json");
  let packages = [];
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packages = Object.entries({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    }).map(([name, version]) => ({ name, version }));
  }

  // Query OSV.dev
  const osvResults = [];
  for (let p of packages) {
    const vulns = await queryOSV(
      p.name,
      "npm",
      p.version.replace(/^[^\d]*/, "")
    );
    for (let v of vulns) {
      osvResults.push({
        id: v.id,
        package: p.name,
        version: p.version,
        severity: v.severity || "High",
        reachability: { status: "Unknown", trace: "" },
        fix: v.fixed_in?.join(", ") || "Check advisory",
        resolution: v.summary || "",
      });
    }
  }

  // Run Semgrep
  const semgrepResults = await runSemgrep(repoPath);
  const semgrepFormatted = semgrepResults.map((r) => ({
    id: r.extra?.metadata?.id || "SEM-UNKNOWN",
    package: r.check_id,
    version: "N/A",
    severity: r.extra?.severity || "Medium",
    reachability: { status: "Unknown", trace: r.extra?.trace || "" },
    fix: "Manual review suggested",
    resolution: r.extra?.message || r.msg || "",
  }));

  // Run CodeQL
  const codeQLResults = await runCodeQL(repoPath);
  const codeQLFormatted = codeQLResults.map((r) => ({
    id: r.ruleId,
    package: r.toolComponent || "CodeQL",
    version: "N/A",
    severity: r.level || "High",
    reachability: { status: "Unknown", trace: "" },
    fix: "Manual review suggested",
    resolution: r.message.text || "",
  }));

  tmpDir.cleanup();

  return {
    metadata: { ecosystem: "npm", score: 100 },
    vulnerabilities: [...osvResults, ...semgrepFormatted, ...codeQLFormatted],
    anatomy: [
      {
        category: "repo",
        component: "structure",
        evidence: [],
        reason: "Code structure overview",
        analysis: "N/A",
      },
    ],
  };
}

// API endpoint
app.post("/api/scan/orchestrate", async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: "repoUrl required" });

    const result = await scanRepo(repoUrl);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Security backend listening on port ${PORT}`)
);
