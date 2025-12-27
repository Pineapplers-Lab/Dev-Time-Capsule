import { repoMapper } from "../agents/repoMapper";
import { dependencyAgent } from "../agents/dependencyAgent";
import { semanticsAgent } from "../agents/semanticsAgent";
import { architectureAgent } from "../agents/architectureAgent";
import { securityAgent } from "../agents/securityAgent";

export async function scanRepository(repoUrl: string) {
    const repoData = await repoMapper(repoUrl);
    const { repoPath } = repoData;

    const [tech_stack, anatomy, architecture, vulnerabilities] = await Promise.all([
        dependencyAgent(repoPath),
        semanticsAgent(repoPath),
        architectureAgent(repoPath),
        securityAgent(repoPath),
    ]);

    return {
        repo_overview: `Scan completed for ${repoUrl}`,
        tech_stack,
        files: repoData.files,
        anatomy,
        architecture,
        vulnerabilities,
        onboarding_checklist: [
            { task: "Setup Project", description: "Initialize repo", priority: "High", command: "npm install" },
            { task: "Run Tests", description: "Ensure all tests pass", priority: "High", command: "npm test" }
        ],
        metadata: { onboarding_score: 90, last_scan: new Date().toISOString() }
    };
}
