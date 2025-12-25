// app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ScanResult } from "../../../types";

// Simulate repo analysis
const analyzeRepo = async (repoUrl: string): Promise<ScanResult> => {
  const mockResult: ScanResult = {
    repo_overview: `Scanned repo: ${repoUrl}`,
    anatomy: [
      {
        architecture_tier: "Frontend",
        component: "Navbar",
        purpose: "Navigation bar for site pages",
        analysis: "Simple React functional component using TailwindCSS",
      },
      {
        architecture_tier: "Backend",
        component: "API Handler",
        purpose: "Handles scan POST requests",
        analysis: "Next.js app router API route",
      },
    ],
    onboarding_checklist: [
      { task: "Setup Project", description: "Initialize repository", command: "npm install" },
      { task: "Run Tests", description: "Ensure all tests pass", command: "npm test" },
    ],
    tech_stack: ["React", "TypeScript", "Node"],
    metadata: { onboarding_score: 90 },
  };
  return new Promise((resolve) => setTimeout(() => resolve(mockResult), 1000));
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.repoUrl || typeof body.repoUrl !== "string") {
      return NextResponse.json({ error: "repoUrl is required and must be a string" }, { status: 400 });
    }

    const scanResults = await analyzeRepo(body.repoUrl);

    return NextResponse.json(scanResults, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scan failed" }, { status: 500 });
  }
}
