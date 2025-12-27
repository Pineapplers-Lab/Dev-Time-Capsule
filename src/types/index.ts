export interface AnatomyItem {
    name: string;
    file: string;
}

export interface ArchitectureItem {
    architecture_tier: string;
    component: string;
    purpose: string;
    analysis: string;
}

export interface FileItem {
    path: string;
}

export interface ScanResult {
    repo_overview: string;
    tech_stack: string[];
    files: FileItem[];
    anatomy: AnatomyItem[];
    architecture: ArchitectureItem[];
    vulnerabilities: any[];
    onboarding_checklist: any[];
    metadata: { onboarding_score: number; last_scan: string };
}
