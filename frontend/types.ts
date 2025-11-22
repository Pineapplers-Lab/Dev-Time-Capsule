export interface RepoAnalysis {
  repo_id: string;
  environment: {
    language: string;
    framework: string;
    nodeVersion: string;
    buildSystem: string;
  };
  dependencies: Array<{ name: string; version: string; type: 'prod' | 'dev'; is_deprecated?: boolean }>;
  structure: FileNode;
  tasks: string[];
  security: SecurityIssue[];
  startup_issues: StartupIssue[];
}

export interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  file: string;
  line: number;
  description: string;
}

export interface StartupIssue {
  type: 'error' | 'warning';
  title: string;
  description: string;
  fix: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  loc?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  isLoading?: boolean;
}