// src/lib/scanner/index.ts

export interface Step {
    title: string;
    desc: string;
    cmd: string;
    priority: "High" | "Medium" | "Low";
}

export interface DXReport {
    steps: Step[];
}

export interface Component {
    name: string;
    tier: string;
    purpose: string;
}

export interface ArchitectReport {
    summary: string;
    components: Component[];
}

export interface Vulnerability {
    pkg: string;
    desc: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    fix_command: string;
}

export interface SecurityReport {
    vulnerabilities: Vulnerability[];
}

export interface AgentsReports {
    architect: ArchitectReport;
    dx: DXReport;
    security: SecurityReport;
}

export interface Metadata {
    onboarding_score: number;
    last_scan: string;
    risk_score: number;
    score: number; // overall health score
}

export interface ScanResult {
    metadata: Metadata;
    agents_reports: AgentsReports;
}

// Dummy scan function for testing
export function runScan(repoUrl: string): ScanResult {
    return {
        metadata: {
            onboarding_score: 82,
            last_scan: new Date().toISOString(),
            risk_score: 10,
            score: 75
        },
        agents_reports: {
            architect: {
                summary: "This project has a modular architecture with clear layers.",
                components: [
                    { name: "API Layer", tier: "Tier 1", purpose: "Handles HTTP requests and routing" },
                    { name: "Business Logic", tier: "Tier 2", purpose: "Processes core operations" },
                    { name: "Database Layer", tier: "Tier 3", purpose: "Stores persistent data" }
                ]
            },
            dx: {
                steps: [
                    { title: "Setup Environment", desc: "Install dependencies and configure environment", cmd: "npm install && npm run setup", priority: "High" },
                    { title: "Run Tests", desc: "Execute automated test suite", cmd: "npm test", priority: "Medium" }
                ]
            },
            security: {
                vulnerabilities: [
                    { pkg: "lodash", desc: "Prototype pollution vulnerability", severity: "Critical", fix_command: "npm update lodash" },
                    { pkg: "express", desc: "Denial of service vulnerability", severity: "High", fix_command: "npm update express" }
                ]
            }
        }
    };
}
