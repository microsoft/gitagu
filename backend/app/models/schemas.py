from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class RepositoryAnalysisRequest(BaseModel):
    owner: str
    repo: str
    agent_id: str
    
class RepositoryAnalysisResponse(BaseModel):
    agent_id: str
    repo_name: str
    analysis: str
    error: Optional[str] = None
    setup_commands: Optional[Dict[str, str]] = None

class RepositoryFileInfo(BaseModel):
    path: str
    type: str  # "blob" or "tree"
    size: Optional[int] = None

class RepositoryInfoResponse(BaseModel):
    full_name: str
    description: str
    language: str
    stars: int
    default_branch: str
    readme: Optional[str] = None
    files: Optional[List[RepositoryFileInfo]] = None

class DevinSetupCommand(BaseModel):
    step: str
    description: str
    commands: List[str]

# Streaming analysis progress models
class AnalysisProgressUpdate(BaseModel):
    step: int  # 1, 2, or 3
    step_name: str
    status: str  # "starting", "in_progress", "completed", "failed"
    message: str
    progress_percentage: int  # 0-100
    elapsed_time: Optional[float] = None
    details: Optional[Dict[str, Any]] = None

# Task breakdown models
class TaskBreakdownRequest(BaseModel):
    request: str

class Task(BaseModel):
    title: str
    description: str

class TaskBreakdownResponse(BaseModel):
    tasks: List[Task]

# Devin session models
class DevinSessionRequest(BaseModel):
    api_key: str
    prompt: str
    snapshot_id: Optional[str] = None
    playbook_id: Optional[str] = None

class DevinSessionResponse(BaseModel):
    session_id: str
    session_url: str

class CodexPlaygroundRequest(BaseModel):
    owner: str
    repo: str
    prompt: str
    azure_openai_endpoint: str
    azure_openai_key: str
    azure_openai_deployment: str = "gpt-4o"

class CodexPlaygroundResponse(BaseModel):
    task_id: str
    workflow_run_id: Optional[int] = None
    runner_name: Optional[str] = None
    status: str

class PlaygroundTaskStatus(BaseModel):
    task_id: str
    status: str
    workflow_run_id: Optional[int] = None
    logs_url: Optional[str] = None
    artifacts_url: Optional[str] = None
    error: Optional[str] = None

class RunnerTokenRequest(BaseModel):
    owner: str
    repo: str
