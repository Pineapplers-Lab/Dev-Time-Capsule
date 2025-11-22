import os
import sys
from pathlib import Path

# ==========================================
# 1. FILE CONTENTS DEFINITION
# ==========================================

# --- BACKEND FILES ---

BACKEND_REQUIREMENTS = """
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
google-generativeai>=0.3.2
python-multipart
"""

BACKEND_MAIN = """
import os
import shutil
import tempfile
import json
import re
import subprocess
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# AI Integration (Optional)
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

app = FastAPI(title="RepoLens Backend")

# Allow CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class AnalyzeRequest(BaseModel):
    repo_url: str

class ChatRequest(BaseModel):
    repo_id: str
    message: str
    history: List[Dict[str, str]]

class FileNode(BaseModel):
    name: str
    type: str
    children: Optional[List['FileNode']] = None
    loc: Optional[int] = None

class SecurityIssue(BaseModel):
    severity: str
    file: str
    line: int
    description: str

class StartupIssue(BaseModel):
    type: str
    title: str
    description: str
    fix: str

class AnalysisResult(BaseModel):
    repo_id: str
    environment: Dict[str, str]
    dependencies: List[Dict[str, Any]]
    structure: FileNode
    tasks: List[str]
    security: List[SecurityIssue]
    startup_issues: List[StartupIssue]

# Context Store
REPO_CONTEXT_STORE = {}

# --- Helpers ---

def clone_repository(url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    try:
        # Basic clone (ensure git is installed)
        subprocess.check_call(["git", "clone", "--depth", "1", url, temp_dir])
        return temp_dir
    except Exception:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=400, detail="Failed to clone repository")

def get_file_structure(root_dir: str) -> FileNode:
    name = os.path.basename(root_dir)
    node = FileNode(name=name, type="folder", children=[])
    try:
        for entry in os.scandir(root_dir):
            if entry.name.startswith('.') or entry.name == "__pycache__": continue
            if entry.is_dir():
                node.children.append(get_file_structure(entry.path))
            else:
                loc = 0
                try:
                    with open(entry.path, 'r', errors='ignore') as f: loc = sum(1 for _ in f)
                except: pass
                node.children.append(FileNode(name=entry.name, type="file", loc=loc))
    except PermissionError: pass
    node.children.sort(key=lambda x: (x.type != 'folder', x.name))
    return node

def analyze_security(root_dir: str) -> List[SecurityIssue]:
    issues = []
    patterns = {
        r'AWS_ACCESS_KEY_ID\s*=\s*[\'"][A-Z0-9]{20}[\'"]': "Potential AWS Access Key",
        r'Authorization\s*:\s*[\'"]Bearer\s+ey': "Hardcoded JWT Token",
        r'api_key\s*=\s*[\'"][a-zA-Z0-9]{20,}[\'"]': "Hardcoded API Key"
    }
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.startswith('.') or file.endswith(('.png', '.jpg', '.lock')): continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', errors='ignore') as f:
                    for i, line in enumerate(f, 1):
                        for pat, desc in patterns.items():
                            if re.search(pat, line):
                                rel = os.path.relpath(path, root_dir)
                                issues.append(SecurityIssue(severity="high", file=rel, line=i, description=desc))
            except: pass
    return issues

def analyze_environment_and_deps(root_dir: str) -> tuple[Dict, List[Dict]]:
    env = {"language": "Unknown", "framework": "Unknown", "buildSystem": "Unknown", "nodeVersion": "Unknown"}
    deps = []
    
    # JS/TS
    pkg_path = os.path.join(root_dir, "package.json")
    if os.path.exists(pkg_path):
        env["language"] = "JavaScript/TypeScript"
        env["buildSystem"] = "npm"
        try:
            with open(pkg_path) as f:
                data = json.load(f)
                all_deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                if "next" in all_deps: env["framework"] = "Next.js"
                elif "react" in all_deps: env["framework"] = "React"
                
                for name, ver in all_deps.items():
                    is_dep = False
                    clean_ver = ver.replace('^','').replace('~','')
                    # Simple deprecation check heuristic
                    if name == 'react' and clean_ver.startswith('16'): is_dep = True
                    deps.append({"name": name, "version": ver, "type": "prod", "is_deprecated": is_dep})
        except: pass

    # Python
    req_path = os.path.join(root_dir, "requirements.txt")
    if os.path.exists(req_path):
        env["language"] = "Python"
        env["buildSystem"] = "pip"
        try:
            with open(req_path) as f:
                for line in f:
                    parts = line.strip().split('==')
                    if len(parts) > 0:
                        name = parts[0]
                        deps.append({"name": name, "version": parts[1] if len(parts)>1 else "latest", "type": "prod"})
                        if "django" in name.lower(): env["framework"] = "Django"
                        if "fastapi" in name.lower(): env["framework"] = "FastAPI"
        except: pass
    
    return env, deps

def analyze_startup(root_dir: str, env: Dict) -> List[StartupIssue]:
    issues = []
    files = os.listdir(root_dir)
    if ".env.example" in files and ".env" not in files:
        issues.append(StartupIssue(type="error", title="Missing Config", description="Missing .env file", fix="cp .env.example .env"))
    if env["language"] == "JavaScript/TypeScript" and "package-lock.json" not in files:
        issues.append(StartupIssue(type="warning", title="No Lockfile", description="Inconsistent builds", fix="npm install"))
    return issues

def generate_tasks(root_dir: str, env: Dict) -> List[str]:
    tasks = ["git clone <repo>"]
    if env["language"] == "JavaScript/TypeScript":
        tasks.append("npm install")
        tasks.append("npm run dev")
    elif env["language"] == "Python":
        tasks.append("python -m venv venv")
        tasks.append("source venv/bin/activate")
        tasks.append("pip install -r requirements.txt")
    return tasks

def cleanup_temp(path: str):
    shutil.rmtree(path, ignore_errors=True)

# --- Routes ---

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_repo(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    try:
        repo_path = clone_repository(request.repo_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        structure = get_file_structure(repo_path)
        env, deps = analyze_environment_and_deps(repo_path)
        security = analyze_security(repo_path)
        startup = analyze_startup(repo_path, env)
        tasks = generate_tasks(repo_path, env)
        
        result = AnalysisResult(
            repo_id=request.repo_url,
            environment=env, dependencies=deps[:50], structure=structure,
            tasks=tasks, security=security, startup_issues=startup
        )
        REPO_CONTEXT_STORE[request.repo_url] = result.dict()
        background_tasks.add_task(cleanup_temp, repo_path)
        return result
    except Exception as e:
        cleanup_temp(repo_path)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/chat")
async def chat_agent(request: ChatRequest):
    context = REPO_CONTEXT_STORE.get(request.repo_id)
    
    if HAS_GENAI and os.environ.get("GEMINI_API_KEY"):
        try:
            genai.configure(api_key=os.environ["GEMINI_API_KEY"])
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"Context: {json.dumps(context, default=str)}\nUser: {request.message}\nHelpful coding answer:"
            response = model.generate_content(prompt)
            return {"response": response.text}
        except: pass

    # Fallback Rule-based
    msg = request.message.lower()
    resp = "I can help check configuration and structure."
    if "security" in msg: resp = "Checked for secrets. See the Security tab."
    elif "run" in msg: resp = "Check the tasks list for run commands."
    
    return {"response": resp}
"""

# --- FRONTEND FILES ---

FRONTEND_PACKAGE_JSON = """{
  "name": "repolens-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.300.0",
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
"""

FRONTEND_TSCONFIG = """{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"""

FRONTEND_TAILWIND = """
import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
"""

FRONTEND_GLOBALS_CSS = """
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #f8fafc;
}
"""

FRONTEND_LAYOUT = """
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoLens AI",
  description: "Repository Analysis Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
"""

FRONTEND_TYPES = """
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
"""

FRONTEND_PRIMITIVES = """
import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'blue' | 'red' | 'yellow' }) => {
  const styles: any = {
    default: "bg-slate-100 text-slate-700",
    outline: "border border-slate-200 text-slate-600",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    yellow: "bg-amber-50 text-amber-600 border border-amber-100"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};
"""

FRONTEND_INTAKE = """
import React, { useState } from 'react';
import { Search, ArrowRight, ShieldAlert, Terminal, Bot, Code2 } from 'lucide-react';

export const IntakeView = ({ onAnalyze }: { onAnalyze: (url: string) => void }) => {
  const [url, setUrl] = useState("");
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <div className="h-16 w-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-slate-200">
          <Code2 className="text-white h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">RepoLens AI</h1>
        <p className="text-slate-500 text-lg">Deep scan for security, startup issues, and AI-guided walkthroughs.</p>
      </div>
      <div className="w-full relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
        <input
          type="text"
          placeholder="github.com/username/repository"
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none shadow-sm text-lg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && url && onAnalyze(url)}
        />
        <button onClick={() => url && onAnalyze(url)} className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 rounded-xl flex items-center justify-center">
          <ArrowRight className="text-white h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
"""

FRONTEND_DASHBOARD = """
import React from 'react';
import { Code2, Layers, Cpu, Zap, ShieldAlert, AlertTriangle, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { Card, Badge } from '../ui/Primitives';
import { RepoAnalysis } from '../../types';

export const DashboardView = ({ data, onStartWalkthrough }: { data: RepoAnalysis, onStartWalkthrough: () => void }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Code2 size={18} /></div>
             <h3 className="text-sm font-medium text-slate-500">Language</h3>
           </div>
           <p className="text-xl font-semibold text-slate-900">{data.environment.language}</p>
        </Card>
        {/* Simplified for brevity - similar structure for Framework, Engine, Build */}
        <Card className="p-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Layers size={18} /></div>
             <h3 className="text-sm font-medium text-slate-500">Framework</h3>
           </div>
           <p className="text-xl font-semibold text-slate-900">{data.environment.framework}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {data.security.length > 0 && (
            <Card className="p-6 border-red-100 bg-red-50/30">
              <div className="flex items-center gap-2 mb-4 text-red-700">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-semibold">Security Vulnerabilities Detected</h3>
              </div>
              <div className="space-y-3">
                {data.security.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{issue.description}</span>
                        <Badge variant="red">{issue.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{issue.file}:{issue.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Dependencies</h3>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr><th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Package</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Version</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.dependencies.map((dep, i) => (
                    <tr key={i}><td className="py-3 px-4 text-sm font-medium text-slate-900">{dep.name}</td><td className="py-3 px-4 text-sm text-slate-500 font-mono">{dep.version}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-slate-200">
             <div className="flex items-center gap-2 mb-4 text-slate-900"><Terminal className="h-5 w-5" /><h3 className="font-semibold">Startup Check</h3></div>
             {data.startup_issues.length === 0 ? (
               <div className="flex flex-col items-center text-center py-4"><CheckCircle2 className="h-6 w-6 text-green-600 mb-2"/><p className="text-sm text-green-700">Ready to Run</p></div>
             ) : (
               <div className="space-y-3">
                 {data.startup_issues.map((issue, i) => (
                   <div key={i} className="p-3 rounded-lg border bg-red-50 border-red-100 text-left">
                     <div className="flex items-center gap-2 mb-1"><XCircle size={14} className="text-red-600"/><span className="text-xs font-bold uppercase text-red-700">{issue.title}</span></div>
                     <p className="text-sm text-slate-800 mb-1">{issue.description}</p>
                     <div className="text-xs bg-white/60 p-1.5 rounded font-mono text-slate-600">Fix: {issue.fix}</div>
                   </div>
                 ))}
               </div>
             )}
           </Card>
           <Card className="p-6 bg-slate-900 text-white border-slate-900">
             <h3 className="text-lg font-semibold mb-6">Run Instructions</h3>
             <div className="space-y-4">
               {data.tasks.map((task, i) => (
                 <div key={i} className="flex items-start gap-3"><div className="mt-0.5 h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0"><span className="text-xs text-slate-400">{i + 1}</span></div><p className="text-sm text-slate-300 font-mono">{task}</p></div>
               ))}
             </div>
             <button onClick={onStartWalkthrough} className="mt-8 w-full py-3 bg-white text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-100">Start Walkthrough</button>
           </Card>
        </div>
      </div>
    </div>
  );
};
"""

FRONTEND_STRUCTURE = """
import React, { useState } from 'react';
import { Folder, FileCode, GitBranch, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Primitives';
import { FileNode } from '../../types';

export const StructureView = ({ structure }: { structure: FileNode }) => {
  const renderTree = (node: FileNode, depth = 0) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.name} style={{ paddingLeft: depth > 0 ? 20 : 0 }}>
        <div className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer select-none hover:bg-slate-50`} onClick={() => hasChildren && setIsOpen(!isOpen)}>
          <div className="mr-2 text-slate-400">{hasChildren ? (isOpen ? <ChevronRight className="rotate-90 h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4" />}</div>
          <div className="mr-2">{node.type === 'folder' ? <Folder className={`h-4 w-4 ${hasChildren ? 'text-blue-500' : 'text-slate-400'}`} /> : <FileCode className="h-4 w-4 text-slate-400" />}</div>
          <span className={`text-sm ${node.type === 'folder' ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{node.name}</span>
        </div>
        {isOpen && node.children && <div className="border-l border-slate-100 ml-3.5">{node.children.map(child => renderTree(child, depth + 1))}</div>}
      </div>
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      <Card className="p-6 overflow-y-auto lg:col-span-1 h-full">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">File Tree</h3>
        {renderTree(structure)}
      </Card>
      <Card className="p-0 lg:col-span-2 h-full relative overflow-hidden bg-slate-50 border-slate-200 flex items-center justify-center">
         <div className="text-center"><div className="inline-flex p-4 bg-white rounded-full shadow-lg mb-4"><GitBranch className="h-8 w-8 text-blue-500" /></div><p className="text-slate-500 font-medium">Interactive Graph View</p></div>
      </Card>
    </div>
  );
};
"""

FRONTEND_WALKTHROUGH = """
import React, { useState, useEffect, useRef } from 'react';
import { Bot, ArrowRight, Lock } from 'lucide-react';
import { Card, Badge } from '../ui/Primitives';
import { ChatMessage } from '../../types';

export const TaskWalkthroughView = ({ repoId }: { repoId: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'system', content: "I'm your AI repo assistant. Ask me anything about the codebase." }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = typeof textOverride === 'string' ? textOverride : input;
    if (!messageText.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: messageText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_id: repoId, message: messageText, history: [] })
      });
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'system', content: data.response }]);
    } catch (error) {
      console.warn("Backend unreachable, using Simulation.");
      setTimeout(() => {
         setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'system', content: "Backend disconnected. Simulating response: Try running 'npm install'." }]);
      }, 800);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2"><Bot className="text-blue-600" size={20} /><h3 className="font-semibold text-slate-900">Gemini Agent</h3></div>
          <Badge variant="blue">AI Connected</Badge>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-slate-400 text-sm p-4">AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-100 bg-white relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" disabled={isLoading} />
          <button onClick={() => handleSend()} disabled={isLoading} className="absolute right-6 top-6"><ArrowRight className="text-slate-400 h-4 w-4" /></button>
        </div>
      </Card>
      <div className="space-y-6">
         <Card className="p-6"><h3 className="text-sm font-semibold text-slate-900 mb-4">Suggested Prompts</h3><div className="space-y-2">{['Fix security issues', 'Why won\'t it run?', 'Docker setup'].map((q, i) => <button key={i} onClick={() => handleSend(q)} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">{q}</button>)}</div></Card>
      </div>
    </div>
  );
};
"""

FRONTEND_APP = """
"use client";
import React, { useState } from 'react';
import { Code2, Box, GitBranch, Bot } from 'lucide-react';
import { RepoAnalysis } from './types';
import { IntakeView } from './components/views/IntakeView';
import { DashboardView } from './components/views/DashboardView';
import { StructureView } from './components/views/StructureView';
import { TaskWalkthroughView } from './components/views/TaskWalkthroughView';

// Mock Data Fallback
const MOCK_DATA: RepoAnalysis = {
  repo_id: "github.com/mock/repo",
  environment: { language: "TypeScript", framework: "Next.js", nodeVersion: ">=18", buildSystem: "Turbo" },
  dependencies: [{ name: "react", version: "18.2", type: "prod" }],
  structure: { name: "root", type: "folder", children: [{ name: "src", type: "folder", children: [] }] },
  tasks: ["npm install", "npm run dev"],
  security: [],
  startup_issues: []
};

export default function Home() {
  const [view, setView] = useState<'intake' | 'dashboard' | 'structure' | 'walkthrough'>('intake');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoAnalysis | null>(null);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repo_url: url })
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setData(result);
      setView('dashboard');
    } catch (error) {
      console.warn("Backend unavailable. Using mock data.");
      setTimeout(() => { setData({ ...MOCK_DATA, repo_id: url }); setView('dashboard'); setLoading(false); }, 1500);
    } finally { setLoading(false); }
  };

  if (view === 'intake') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center"><Code2 className="text-white h-5 w-5" /></div><span className="font-semibold text-slate-900">RepoLens</span></div>
        </header>
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {loading ? <div className="absolute inset-0 flex items-center justify-center bg-white z-50">Loading...</div> : <IntakeView onAnalyze={handleAnalyze} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-100"><div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('intake')}><Code2 className="text-slate-900 h-6 w-6" /><span className="font-semibold text-slate-900">RepoLens</span></div></div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'dashboard' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><Box size={18} /> Overview</button>
          <button onClick={() => setView('structure')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'structure' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><GitBranch size={18} /> Structure</button>
          <button onClick={() => setView('walkthrough')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'walkthrough' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><Bot size={18} /> Assistant</button>
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto">
        {view === 'dashboard' && data && <DashboardView data={data} onStartWalkthrough={() => setView('walkthrough')} />}
        {view === 'structure' && data && <StructureView structure={data.structure} />}
        {view === 'walkthrough' && data && <TaskWalkthroughView repoId={data.repo_id} />}
      </main>
    </div>
  );
}
"""

# ==========================================
# 2. FILE WRITING LOGIC
# ==========================================

ROOT_DIR = "repolens_project"

def write_file(path: str, content: str):
    full_path = os.path.join(ROOT_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Created: {path}")

def create_project():
    print(f"Generating RepoLens Project in ./{ROOT_DIR} ...")
    
    # --- Backend ---
    write_file("backend/main.py", BACKEND_MAIN)
    write_file("backend/requirements.txt", BACKEND_REQUIREMENTS)
    
    # --- Frontend ---
    write_file("frontend/package.json", FRONTEND_PACKAGE_JSON)
    write_file("frontend/tsconfig.json", FRONTEND_TSCONFIG)
    write_file("frontend/tailwind.config.ts", FRONTEND_TAILWIND)
    write_file("frontend/app/globals.css", FRONTEND_GLOBALS_CSS)
    write_file("frontend/app/layout.tsx", FRONTEND_LAYOUT)
    write_file("frontend/app/page.tsx", FRONTEND_APP)
    write_file("frontend/types.ts", FRONTEND_TYPES)
    
    # Frontend Components
    write_file("frontend/components/ui/Primitives.tsx", FRONTEND_PRIMITIVES)
    write_file("frontend/components/views/IntakeView.tsx", FRONTEND_INTAKE)
    write_file("frontend/components/views/DashboardView.tsx", FRONTEND_DASHBOARD)
    write_file("frontend/components/views/StructureView.tsx", FRONTEND_STRUCTURE)
    write_file("frontend/components/views/TaskWalkthroughView.tsx", FRONTEND_WALKTHROUGH)
    
    # Configs (Empty for standard setup)
    write_file("frontend/postcss.config.js", "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {}, }, };")
    write_file("frontend/next.config.js", "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;")

    print("\n" + "="*40)
    print("PROJECT GENERATION COMPLETE")
    print("="*40)
    print("\nTo run the project, follow these steps in TWO separate terminals:\n")
    
    print("--- TERMINAL 1 (BACKEND) ---")
    print(f"cd {ROOT_DIR}/backend")
    print("python -m venv venv")
    print("source venv/bin/activate   # On Windows: venv\\Scripts\\activate")
    print("pip install -r requirements.txt")
    print("uvicorn main:app --reload --port 8000\n")
    
    print("--- TERMINAL 2 (FRONTEND) ---")
    print(f"cd {ROOT_DIR}/frontend")
    print("npm install")
    print("npm run dev\n")
    
    print("Open http://localhost:3000 in your browser.")

if __name__ == "__main__":
    create_project()