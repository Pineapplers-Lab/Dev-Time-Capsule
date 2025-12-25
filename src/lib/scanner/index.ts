import { ScanResult } from "@/types";

export async function runScan(repoUrl: string): Promise<ScanResult> {
    return {
        repo_overview: `Repository analyzed: ${repoUrl}`,
        tech_stack: ["Next.js", "React", "TypeScript"],
        onboarding_checklist: [
            {
                task: "Install dependencies",
                description: "Install all required packages",
                command: "npm install"
            },
            {
                task: "Run development server",
                description: "Start the app locally",
                command: "npm run dev"
            }
        ],
        vulnerabilities: [],
        metadata: {
            onboarding_score: 82,
            risk_score: 10
        }
    };
}
