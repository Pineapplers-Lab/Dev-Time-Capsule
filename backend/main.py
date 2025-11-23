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

from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

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

REPO_CONTEXT_STORE: Dict[str, AnalysisResult] = {}

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
DEVICE = "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
llm = pipeline("text-generation", model=model, tokenizer=tokenizer, device=-1)

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
    for entry in os.scandir(root_dir):
        if entry.name.startswith('.') or entry.name == "__pycache__":
            continue
        if entry.is_dir():
            node.children.append(get_file_structure(entry.path))
        else:
            loc = 0
            try:
                loc = sum(1 for _ in open(entry.path, 'r', errors='ignore'))
            except:
                pass
            node.children.append(FileNode(name=entry.name, type="file", loc=loc))
    node.children.sort(key=lambda x: (x.type != "folder", x.name))
    return node

def analyze_security(root_dir: str) -> List[SecurityIssue]:
    issues = []
    patterns = {
        r"AWS_ACCESS_KEY_ID\s*=\s*['\"][A-Z0-9]{20}['\"]": "AWS key",
        r"Authorization\s*:\s*['\"]Bearer\s+ey": "Hardcoded JWT",
        r"api_key\s*=\s*['\"][a-zA-Z0-9]{20,}['\"]": "API key"
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

def analyze_environment_and_deps(root_dir: str):
    env = {"language": "Unknown", "framework": "Unknown", "buildSystem": "Unknown"}
    deps = []

    pkg_path = os.path.join(root_dir, "package.json")
    if os.path.exists(pkg_path):
        env["language"] = "JavaScript"
        env["buildSystem"] = "npm"
        with open(pkg_path) as f:
            data = json.load(f)
            all_deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            for name, ver in all_deps.items():
                deps.append({"name": name, "version": ver})
                if name == "next":
                    env["framework"] = "Next.js"
                if name == "react":
                    env["framework"] = "React"

    req_path = os.path.join(root_dir, "requirements.txt")
    if os.path.exists(req_path):
        env["language"] = "Python"
        env["buildSystem"] = "pip"
        with open(req_path) as f:
            for line in f:
                parts = line.strip().split("==")
                deps.append({"name": parts[0], "version": parts[1] if len(parts) > 1 else "latest"})
                if "fastapi" in line.lower():
                    env["framework"] = "FastAPI"
                if "django" in line.lower():
                    env["framework"] = "Django"

    return env, deps

def analyze_startup(root_dir: str, env: Dict) -> List[StartupIssue]:
    issues = []
    files = os.listdir(root_dir)
    if ".env.example" in files and ".env" not in files:
        issues.append(StartupIssue(type="error", title="Missing .env", description="Missing environment file", fix="cp .env.example .env"))

    if env["language"] == "JavaScript" and "package-lock.json" not in files:
        issues.append(StartupIssue(type="warning", title="No lockfile", description="Missing package-lock.json", fix="npm install"))

    return issues

def generate_tasks(env: Dict) -> List[str]:
    tasks = []
    if env["language"] == "JavaScript":
        tasks = ["npm install", "npm run dev"]
    if env["language"] == "Python":
        tasks = ["pip install -r requirements.txt", "uvicorn app:app --reload"]
    return tasks

def cleanup_temp(path: str):
    shutil.rmtree(path, ignore_errors=True)

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_repo(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    repo_path = clone_repository(request.repo_url)

    structure = get_file_structure(repo_path)
    env, deps = analyze_environment_and_deps(repo_path)
    security = analyze_security(repo_path)
    startup = analyze_startup(repo_path, env)
    tasks = generate_tasks(env)

    result = AnalysisResult(
        repo_id=request.repo_url,
        environment=env,
        dependencies=deps[:50],
        structure=structure,
        tasks=tasks,
        security=security,
        startup_issues=startup
    )

    REPO_CONTEXT_STORE[request.repo_url] = result
    background_tasks.add_task(cleanup_temp, repo_path)
    return result

@app.post("/chat")
async def chat_agent(request: ChatRequest):
    context = REPO_CONTEXT_STORE.get(request.repo_id)
    if context is None:
        return {"response": "Analyze a repo first."}

    prompt = f"Repo info: {request.message}"
    out = llm(prompt, max_new_tokens=120, do_sample=False)[0]["generated_text"]
    return {"response": out[len(prompt):].strip()}
