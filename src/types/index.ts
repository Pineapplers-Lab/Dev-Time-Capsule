export type View = 'upload' | 'results';
export type Tab = 'onboarding' | 'anatomy' | 'vulns';

export interface ScanResult {
    metadata: {
        onboarding_score: number;
        vuln_count: number;
        critical_count: number;
        last_scan: string;
    };
    repo_overview: string;
    tech_stack: string[];
    onboarding_checklist: {
        task: string;
        description: string;
        priority: 'High' | 'Medium' | 'Low';
        command: string;
    }[];
    anatomy: {
        category: string;
        component: string;
        purpose: string;
        analysis: string;
        architecture_tier: 'Client' | 'Server' | 'Middleware' | 'Data';
    }[];
    vulnerabilities: {
        package: string;
        version: string;
        severity: 'Critical' | 'High' | 'Medium' | 'Low';
        explanation: string;
        resolution: string;
        fix_command: string;
        cve_id: string;
    }[];
}
