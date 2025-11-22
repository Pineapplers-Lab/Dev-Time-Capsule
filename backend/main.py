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

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

app = FastAPI(title="Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

REPO_CONTEXT_STORE = {}

def clone_repository(url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    try:
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
            if entry.name.startswith('.') or entry.name == "__pycache__":
                continue
            if entry.is_dir():
                node.children.append(get_file_structure(entry.path))
            else:
                loc = 0
                try:
                    with open(entry.path, 'r', errors='ignore') as f:
                        loc = sum(1 for _ in f)
                except:
                    pass
                node.children.append(FileNode(name=entry.name, type="file", loc=loc))
    except PermissionError:
        pass
    node.children.sort(key=lambda x: (x.type != 'folder', x.name))
    return node

def analyze_security(root_dir: str) -> List[SecurityIssue]:
    issues = []
    patterns = {
        r"AWS_ACCESS_KEY_ID\s*=\s*['\"][A-Z0-9]{20}['\"]": "Potential AWS Access Key",
        r"Authorization\s*:\s*['\"]Bearer\s+ey": "Hardcoded JWT Token",
        r"api_key\s*=\s*['\"][a-zA-Z0-9]{20,}['\"]": "Hardcoded API Key"
    }
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.startswith('.') or file.endswith(('.png', '.jpg', '.lock')):
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', errors='ignore') as f:
                    for i, line in enumerate(f, 1):
                        for pat, desc in patterns.items():
                            if re.search(pat, line):
                                rel = os.path.relpath(path, root_dir)
                                issues.append(SecurityIssue(severity="high", file=rel, line=i, description=desc))
            except:
                pass
    return issues

def analyze_environment_and_deps(root_dir: str) -> tuple[Dict, List[Dict]]:
    env = {"language": "Unknown", "framework": "Unknown", "buildSystem": "Unknown", "nodeVersion": "Unknown"}
    deps = []
    pkg_path = os.path.join(root_dir, "package.json")
    if os.path.exists(pkg_path):
        env["language"] = "JavaScript/TypeScript"
        env["buildSystem"] = "npm"
        try:
            with open(pkg_path) as f:
                data = json.load(f)
                all_deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                if "next" in all_deps:
                    env["framework"] = "Next.js"
                elif "react" in all_deps:
                    env["framework"] = "React"
                for name, ver in all_deps.items():
                    is_dep = False
                    clean_ver = ver.replace('^', '').replace('~', '')
                    if name == 'react' and clean_ver.startswith('16'):
                        is_dep = True
                    deps.append({"name": name, "version": ver, "type": "prod", "is_deprecated": is_dep})
        except:
            pass
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
                        deps.append({"name": name, "version": parts[1] if len(parts) > 1 else "latest", "type": "prod"})
                        if "django" in name.lower():
                            env["framework"] = "Django"
                        if "fastapi" in name.lower():
                            env["framework"] = "FastAPI"
        except:
            pass
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
            environment=env,
            dependencies=deps[:50],
            structure=structure,
            tasks=tasks,
            security=security,
            startup_issues=startup
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
            model = genai.GenerativeModel("gemini-pro")
            prompt = f"Context: {json.dumps(context, default=str)}\nUser: {request.message}\nHelpful coding answer:"
            response = model.generate_content(prompt)
            return {"response": response.text}
        except:
            pass
    msg = request.message.lower()
    resp = "I can help check configuration and structure."
    if "security" in msg:
        resp = "Checked for secrets. See the Security tab."
    elif "run" in msg:
        resp = "Check the tasks list for run commands."
    return {"response": resp}
