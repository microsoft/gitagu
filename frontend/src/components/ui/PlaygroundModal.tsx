import React, { useState } from 'react';
import { Play, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface PlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoOwner: string;
  repoName: string;
}

interface PlaygroundTask {
  id: string;
  prompt: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failure' | 'cancelled';
  workflowUrl?: string;
  createdAt: Date;
}

const PlaygroundModal: React.FC<PlaygroundModalProps> = ({
  isOpen,
  onClose,
  repoOwner,
  repoName
}) => {
  const [prompt, setPrompt] = useState('');
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [azureDeployment, setAzureDeployment] = useState('gpt-4o');
  const [tasks, setTasks] = useState<PlaygroundTask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !azureEndpoint || !azureKey) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/playground/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repoOwner,
          repo: repoName,
          prompt,
          azure_openai_endpoint: azureEndpoint,
          azure_openai_key: azureKey,
          azure_openai_deployment: azureDeployment
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newTask: PlaygroundTask = {
          id: result.task_id,
          prompt,
          status: 'queued',
          createdAt: new Date()
        };
        setTasks(prev => [newTask, ...prev]);
        setPrompt('');
        
        setTimeout(() => {
          pollTaskStatus(result.task_id);
        }, POLLING_INTERVAL_MS);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to start task');
      }
    } catch (error) {
      console.error('Error starting playground task:', error);
      setError('Failed to start task. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/api/playground/status/${taskId}?owner=${repoOwner}&repo=${repoName}`
      );
      
      if (response.ok) {
        const status = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: status.status, workflowUrl: status.logs_url }
            : task
        ));
        
        if (status.status === 'in_progress' || status.status === 'queued') {
          setTimeout(() => pollTaskStatus(taskId), 5000);
        }
      }
    } catch (error) {
      console.error('Error polling task status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} style={{ color: 'var(--azure-green)' }} />;
      case 'failure':
        return <AlertCircle size={16} style={{ color: 'var(--error-color)' }} />;
      case 'in_progress':
        return <Clock size={16} style={{ color: 'var(--azure-teal)' }} />;
      default:
        return <Clock size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const examplePrompts = [
    "Create a Python function to calculate fibonacci numbers",
    "Write a React component for a todo list",
    "Generate a SQL query to find top customers by revenue",
    "Create a bash script to backup files"
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Codex Playground">
      <div className="playground-modal">
        <div className="playground-header">
          <h3>Run Codex CLI in GitHub Actions</h3>
          <p>Execute natural language coding tasks for {repoOwner}/{repoName}</p>
        </div>

        <form onSubmit={handleSubmit} className="playground-form">
          <div className="form-group">
            <label>Azure OpenAI Endpoint</label>
            <input
              type="url"
              value={azureEndpoint}
              onChange={(e) => setAzureEndpoint(e.target.value)}
              placeholder="https://your-resource.openai.azure.com/"
              required
            />
          </div>

          <div className="form-group">
            <label>Azure OpenAI API Key</label>
            <input
              type="password"
              value={azureKey}
              onChange={(e) => setAzureKey(e.target.value)}
              placeholder="Your Azure OpenAI API key"
              required
            />
          </div>

          <div className="form-group">
            <label>Deployment Name</label>
            <input
              type="text"
              value={azureDeployment}
              onChange={(e) => setAzureDeployment(e.target.value)}
              placeholder="gpt-4o"
              required
            />
          </div>

          <div className="form-group">
            <label>Task Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want Codex to do..."
              rows={4}
              required
            />
            <div className="example-prompts">
              <span>Examples:</span>
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  className="example-prompt"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="agent-btn primary"
            disabled={isSubmitting}
          >
            <Play size={16} />
            {isSubmitting ? 'Starting...' : 'Run Task'}
          </button>
        </form>

        {tasks.length > 0 && (
          <div className="playground-tasks">
            <h4>Recent Tasks</h4>
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <div className="task-prompt">{task.prompt}</div>
                  <div className="task-meta">
                    <div className="task-status">
                      {getStatusIcon(task.status)}
                      <span className={`status-text ${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="task-time">
                      {task.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {task.workflowUrl && (
                  <a 
                    href={task.workflowUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="task-link"
                    title="View in GitHub Actions"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlaygroundModal;
