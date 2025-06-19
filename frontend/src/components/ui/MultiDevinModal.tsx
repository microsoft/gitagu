import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Plus, Play, Minus } from 'lucide-react';
import SetupModal from './SetupModal';
import agents from '../../data/agents';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'creating' | 'created' | 'error';
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

interface ManualTask {
  id: string;
  description: string;
}

interface MultiDevinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiDevinModal: React.FC<MultiDevinModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [apiKey, setApiKey] = useState('');
  const [userRequest, setUserRequest] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [snapshot, setSnapshot] = useState('');
  const [playbook, setPlaybook] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Manual tasks state
  const [manualTasks, setManualTasks] = useState<ManualTask[]>(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: `manual-${i}`,
      description: ''
    }))
  );
  const [processedManualTasks, setProcessedManualTasks] = useState<Task[]>([]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const [hasBreakdown, setHasBreakdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        // Restore body scroll when modal is closed
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  // Helper function to extract repo name from GitHub URL
  const extractRepoName = (url: string): string => {
    if (!url.trim()) return '';
    
    try {
      // Handle various GitHub URL formats
      const cleanUrl = url.trim();
      
      // Remove .git suffix if present
      const withoutGit = cleanUrl.replace(/\.git$/, '');
      
      // Extract owner/repo from GitHub URLs
      const githubMatch = withoutGit.match(/github\.com\/([^\/]+\/[^\/\?#]+)/);
      if (githubMatch) {
        return githubMatch[1];
      }
      
      // If it's already in owner/repo format
      if (withoutGit.match(/^[^\/]+\/[^\/]+$/)) {
        return withoutGit;
      }
      
      return '';
    } catch {
      return '';
    }
  };

  const breakdownTasks = async () => {
    if (!userRequest.trim()) {
      alert('Please enter a request to break down');
      return;
    }

    setIsBreakingDown(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/breakdown-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: userRequest.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to breakdown tasks');
      }

      const data = await response.json();
      const newTasks: Task[] = data.tasks.map((task: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        status: 'pending' as const,
      }));

      setTasks(newTasks);
      setHasBreakdown(true);
    } catch (error) {
      console.error('Error breaking down tasks:', error);
      alert('Failed to break down tasks. Please try again.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const createDevinSession = async (task: Task) => {
    if (!apiKey.trim()) {
      alert('Please enter your Devin API key');
      return;
    }

    const updateTaskStatus = (taskId: string, updates: Partial<Task>) => {
      if (activeTab === 'auto') {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          )
        );
      } else {
        setProcessedManualTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          )
        );
      }
    };

    updateTaskStatus(task.id, { status: 'creating' });

    try {
      // Build the prompt with optional repo prefix
      let finalPrompt = `${task.title}\n\n${task.description}`;
      
      const repoName = extractRepoName(repoUrl);
      if (repoName) {
        finalPrompt = `Using repo https://github.com/${repoName}, do this task - ${task.title}\n\n${task.description}`;
      }

      const sessionPayload: any = {
        api_key: apiKey,
        prompt: finalPrompt,
      };

      if (snapshot.trim()) {
        sessionPayload.snapshot_id = snapshot.trim();
      }

      if (playbook.trim()) {
        sessionPayload.playbook_id = playbook.trim();
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/create-devin-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Devin API error: ${response.status} - ${errorData}`);
      }

      const sessionData = await response.json();
      
      updateTaskStatus(task.id, {
        status: 'created',
        sessionId: sessionData.session_id,
        sessionUrl: sessionData.session_url,
      });
    } catch (error) {
      console.error('Error creating Devin session:', error);
      updateTaskStatus(task.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const addMoreManualTasks = () => {
    const newTasks = Array.from({ length: 3 }, (_, i) => ({
      id: `manual-${Date.now()}-${i}`,
      description: ''
    }));
    setManualTasks(prev => [...prev, ...newTasks]);
  };

  const removeManualTask = (taskId: string) => {
    setManualTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const updateManualTask = (taskId: string, value: string) => {
    setManualTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, description: value } : task
      )
    );
  };

  const processManualTasks = () => {
    const validTasks = manualTasks.filter(task => task.description.trim());
    
    if (validTasks.length === 0) {
      alert('Please fill in at least one task description');
      return;
    }

    const processedTasks: Task[] = validTasks.map((task, index) => {
      // Generate a title from the first few words of the description
      const title = task.description.trim().split(' ').slice(0, 6).join(' ') + 
                   (task.description.trim().split(' ').length > 6 ? '...' : '');
      
      return {
        id: `processed-${task.id}`,
        title: title || `Task ${index + 1}`,
        description: task.description.trim(),
        status: 'pending' as const,
      };
    });

    setProcessedManualTasks(processedTasks);
  };

  const resetModal = () => {
    setApiKey('');
    setUserRequest('');
    setRepoUrl('');
    setSnapshot('');
    setPlaybook('');
    setTasks([]);
    setHasBreakdown(false);
    setIsBreakingDown(false);
    setManualTasks(Array.from({ length: 5 }, (_, i) => ({
      id: `manual-${i}`,
      description: ''
    })));
    setProcessedManualTasks([]);
    setActiveTab('auto');
  };

  const resetCurrentTab = () => {
    if (activeTab === 'auto') {
      setTasks([]);
      setHasBreakdown(false);
      setUserRequest('');
    } else {
      setManualTasks(Array.from({ length: 5 }, (_, i) => ({
        id: `manual-${i}`,
        description: ''
      })));
      setProcessedManualTasks([]);
    }
  };

  const currentTasks = activeTab === 'auto' ? tasks : processedManualTasks;

  const modalContent = (
    <div className="fullscreen-modal-overlay" onClick={handleOverlayClick}>
      <div className="fullscreen-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="fullscreen-modal-header">
          <h2 className="fullscreen-modal-title">Multi Devin Session Manager</h2>
          <div className="modal-close-section">
            <span className="modal-close-tip">Press ESC to close</span>
            <button className="fullscreen-modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'auto' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto')}
          >
            Auto Breakdown
          </button>
          <button
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Tasks
          </button>
        </div>

        <div className="fullscreen-modal-content">
        {/* API Key Section - Common to both tabs */}
        <div className="form-section">
          <label className="form-label">
            Devin API Key
            <a
              href="https://app.devin.ai/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="api-key-link"
            >
              <ExternalLink size={16} />
              Get your API key
            </a>
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your Devin API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="form-help">
            First, get your API key from{' '}
            <a
              href="https://app.devin.ai/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              Devin's settings page
            </a>
          </p>
        </div>

        {/* Repository URL Section - Common to both tabs */}
        <div className="form-section">
          <label className="form-label">Context Repository URL (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://github.com/owner/repo or owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <p className="form-help">
            If provided, tasks will be prefixed with "Using repo owner/repo" for better context
          </p>
        </div>

        {/* Optional Fields - Common to both tabs */}
        <div className="form-row">
          <div className="form-section">
            <label className="form-label">
              Snapshot (Optional)
              <button
                type="button"
                className="api-key-link"
                onClick={() => setSetupModalOpen(true)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <ExternalLink size={16} />
                Create new
              </button>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Snapshot reference"
              value={snapshot}
              onChange={(e) => setSnapshot(e.target.value)}
            />
          </div>
          <div className="form-section">
            <label className="form-label">
              Playbook (Optional)
              <a
                href="https://docs.devin.ai/product-guides/creating-playbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={16} />
                Create new
              </a>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Playbook reference"
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
            />
          </div>
        </div>

        {/* Auto Breakdown Tab Content */}
        {activeTab === 'auto' && (
          <>
            {/* User Request Section */}
            <div className="form-section">
              <label className="form-label">
                Your Request
                <a
                  href="https://deepwiki.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  <ExternalLink size={16} />
                  Need help breaking down tasks?
                </a>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe the work you want Devin to do. This will be broken down into multiple tasks..."
                rows={4}
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
              />
            </div>

            {/* Breakdown Button */}
            {!hasBreakdown && (
              <div className="form-section">
                <button
                  className="btn-primary"
                  onClick={breakdownTasks}
                  disabled={isBreakingDown || !userRequest.trim()}
                >
                  <Plus size={16} />
                  {isBreakingDown ? 'Breaking down tasks...' : 'Break down into tasks'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Manual Tasks Tab Content */}
        {activeTab === 'manual' && (
          <>
            <div className="form-section">
                             <div className="manual-tasks-header">
                 <h3>Manual Task Input</h3>
                 <p className="form-help">
                   Enter your tasks manually. Each task needs a description to be processed.
                 </p>
               </div>

               <div className="manual-tasks-list">
                 {manualTasks.map((task, index) => (
                   <div key={task.id} className="manual-task-item">
                     <div className="manual-task-header">
                       <h4>Task {index + 1}</h4>
                       {manualTasks.length > 5 && (
                         <button
                           className="btn-icon"
                           onClick={() => removeManualTask(task.id)}
                           title="Remove task"
                         >
                           <Minus size={16} />
                         </button>
                       )}
                     </div>
                     <textarea
                       className="form-textarea"
                       placeholder="Describe what you want Devin to do..."
                       rows={4}
                       value={task.description}
                       onChange={(e) => updateManualTask(task.id, e.target.value)}
                     />
                   </div>
                 ))}
               </div>

              <div className="manual-tasks-actions">
                <button
                  className="btn-secondary"
                  onClick={addMoreManualTasks}
                >
                  <Plus size={16} />
                  Add 3 More Tasks
                </button>
                
                {processedManualTasks.length === 0 && (
                  <button
                    className="btn-primary"
                    onClick={processManualTasks}
                  >
                    <Play size={16} />
                    Process Tasks
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tasks Section - Common display for both tabs */}
        {currentTasks.length > 0 && (
          <div className="tasks-section">
            <div className="tasks-header">
              <h3>Tasks</h3>
              <button
                className="btn-secondary"
                onClick={resetCurrentTab}
              >
                Reset Tasks
              </button>
            </div>

            <div className="tasks-list">
              {currentTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-content">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    {task.error && (
                      <p className="task-error">Error: {task.error}</p>
                    )}
                    {task.sessionUrl && (
                      <a
                        href={task.sessionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="task-session-link"
                      >
                        <ExternalLink size={16} />
                        View Session
                      </a>
                    )}
                  </div>
                  <div className="task-actions">
                    {task.status === 'pending' && (
                      <button
                        className="btn-primary btn-small"
                        onClick={() => createDevinSession(task)}
                        disabled={!apiKey.trim()}
                      >
                        <Play size={16} />
                        Create Session
                      </button>
                    )}
                    {task.status === 'creating' && (
                      <div className="task-status creating">Creating...</div>
                    )}
                    {task.status === 'created' && (
                      <div className="task-status created">✓ Created</div>
                    )}
                    {task.status === 'error' && (
                      <button
                        className="btn-primary btn-small"
                        onClick={() => createDevinSession(task)}
                        disabled={!apiKey.trim()}
                      >
                        <Play size={16} />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={resetModal}>
            Reset All
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Get Devin agent data for SetupModal
  const devinAgent = agents.find(agent => agent.id === 'devin');

  // Use portal to render modal outside the main component tree
  const modalPortal = document.getElementById('modal-portal');
  
  return (
    <>
      {modalPortal && createPortal(modalContent, modalPortal)}
      
      {devinAgent && (
        <SetupModal 
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          agent={devinAgent}
        />
      )}
    </>
  );
};

export default MultiDevinModal; 