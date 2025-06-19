import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Agent } from '../types/agent';
import { getAgentLogo } from '../utils/agentUtils';
import SetupModal from './ui/SetupModal';
import MultiDevinModal from './ui/MultiDevinModal';
import PlaygroundModal from './ui/PlaygroundModal';

interface AgentCardProps {
  agent: Agent;
  showAnalyzeButton?: boolean;
  repoName?: string;
  onAnalyzeClick?: (agentId: string, repoName: string) => void;
}

// Function to determine effectiveness level based on agent and use case
const getEffectivenessLevel = (agentId: string, useCase: string, index: number): 'high' | 'medium' | 'low' => {
  // Cross-repo support - most agents struggle with this
  const lowerUseCase = useCase.toLowerCase();
  if (lowerUseCase.includes('cross-repo') || lowerUseCase.includes('multi-repo') || lowerUseCase.includes('cross repo')) {
    console.log(`Cross-repo detected for ${agentId}: "${useCase}"`);
    if (agentId === 'devin') return 'medium'; // Devin has some cross-repo capabilities
    return 'low'; // Most agents don't support cross-repo well
  }

  // GitHub Copilot Completions - best for real-time coding
  if (agentId === 'github-copilot-completions') {
    if (useCase.includes('boilerplate') || useCase.includes('repetitive') || useCase.includes('typos')) return 'high';
    if (useCase.includes('multi-file') || useCase.includes('complex')) return 'medium';
    return index < 2 ? 'high' : 'medium';
  }
  
  // GitHub Copilot Agent - good for autonomous issue work
  if (agentId === 'github-copilot-agent') {
    if (useCase.includes('Low-to-medium') || useCase.includes('Bug fixes') || useCase.includes('test coverage')) return 'high';
    if (useCase.includes('Documentation') || useCase.includes('technical debt')) return 'medium';
    return index < 3 ? 'high' : 'medium';
  }
  
  // Devin - excellent for complex development tasks
  if (agentId === 'devin') {
    if (useCase.includes('refactors') || useCase.includes('migrations') || useCase.includes('integrations') || useCase.includes('test coverage')) return 'high';
    if (useCase.includes('PR reviews')) return 'medium';
    return index < 2 ? 'high' : 'medium';
  }
  
  // CLI tools - good for specific tasks, variable effectiveness
  if (agentId === 'codex-cli') {
    return index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
  }
  
  // SRE Agent - specialized for operations
  if (agentId === 'sreagent') {
    if (useCase.includes('monitoring') || useCase.includes('alerts')) return 'high';
    if (useCase.includes('performance') || useCase.includes('automation')) return 'medium';
    return 'medium';
  }
  
  // Default fallback
  return index < 2 ? 'high' : 'medium';
};

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  showAnalyzeButton = false, 
  repoName = '', 
  onAnalyzeClick 
}) => {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [multiDevinModalOpen, setMultiDevinModalOpen] = useState(false);
  const [playgroundModalOpen, setPlaygroundModalOpen] = useState(false);

  return (
    <div className="agent-card" data-category={agent.category}>
      <div className="agent-header">
        <div className="agent-icon">
          <img 
            src={getAgentLogo(agent.id)} 
            alt={`${agent.name} logo`}
            className="agent-logo"
          />
        </div>
        <div className="agent-info">
          <h3>{agent.name}</h3>
          <div className="agent-type">
            {agent.category === 'code-completion'
              ? 'Code Completion Agent'
              : agent.category === 'async-swe'
              ? 'Async SWE Agent'
              : agent.category === 'cli'
              ? 'CLI Tool'
              : 'DevOps Agent'}
          </div>
        </div>
      </div>

      <p className="agent-description">{agent.description}</p>

      {!showAnalyzeButton ? (
        <>
          <div className="agent-comparison-table">
            <h4 className="comparison-table-title">Where It Shines</h4>
            <div className="comparison-table">
              <div className="comparison-table-row header">
                <div className="comparison-table-cell">Use Case</div>
                <div className="comparison-table-cell">Effectiveness</div>
              </div>
              {agent.useCases && agent.useCases.slice(0, 4).map((useCase, index) => (
                <div key={index} className="comparison-table-row">
                  <div className="comparison-table-cell">{useCase}</div>
                  <div className="comparison-table-cell">
                    <div className={`effectiveness-indicator ${getEffectivenessLevel(agent.id, useCase, index)}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <ul className="agent-features">
            <h4>Key Strengths</h4>
            {agent.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="agent-features">
          {agent.id === 'github-copilot-agent' && (
            <>
              <li>Enable Copilot Agent in organization and repository settings</li>
              <li>Create well-scoped issues with clear acceptance criteria</li>
              <li>Assign issues to "Copilot" to trigger autonomous development</li>
              <li>Monitor progress via session logs and PR updates</li>
              <li>Review and iterate using PR comments</li>
            </>
          )}
          {agent.id === 'devin' && (
            <>
              <li>Access Devin through Azure Marketplace deployment</li>
              <li>Connect your GitHub account and repository permissions</li>
              <li>Add this repository to your Devin workspace</li>
              <li>Configure Devin's machine for your project dependencies</li>
              <li>Start collaborating with Devin through the embedded IDE</li>
            </>
          )}
          {agent.id === 'codex-cli' && (
            <>
              <li>Set up Azure OpenAI Service with Codex</li>
              <li>Clone this repository locally</li>
              <li>Use the Codex CLI to generate code or assist with tasks</li>
            </>
          )}
          {agent.id === 'claude-code' && (
            <>
              <li>Access Claude Code through Azure OpenAI Service</li>
              <li>Share this repository's code with Claude</li>
              <li>
                Ask for code explanations or refactoring suggestions
              </li>
            </>
          )}
          {agent.id === 'sreagent' && (
            <>
              <li>Set up SREAgent in your Azure environment</li>
              <li>Connect this repository for monitoring</li>
              <li>
                Configure alerts and automated remediation policies
              </li>
            </>
          )}
        </ul>
      )}

      <div className="agent-actions">
        {showAnalyzeButton && onAnalyzeClick ? (
          <>
            <button
              className="agent-btn primary"
              onClick={() => onAnalyzeClick(agent.id, repoName)}
            >
              Analyze Repo for Configuration
            </button>
            {agent.id === 'codex-cli' && (
              <button 
                className="agent-btn secondary"
                onClick={() => setPlaygroundModalOpen(true)}
              >
                🎮 Playground
              </button>
            )}
          </>
        ) : (
          <>
            <button 
              className="agent-btn primary"
              onClick={() => setSetupModalOpen(true)}
            >
              Setup Guide
            </button>
            {agent.id === 'devin' && (
              <button 
                className="agent-btn secondary"
                onClick={() => setMultiDevinModalOpen(true)}
              >
                Multi Devin
              </button>
            )}
            <a 
              href={agent.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="agent-btn secondary"
            >
              Get Started <ExternalLink size={16} />
            </a>
          </>
        )}
      </div>

      <SetupModal 
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        agent={agent}
      />
      
      {agent.id === 'devin' && (
        <MultiDevinModal 
          isOpen={multiDevinModalOpen}
          onClose={() => setMultiDevinModalOpen(false)}
        />
      )}
      
      {agent.id === 'codex-cli' && (
        <PlaygroundModal 
          isOpen={playgroundModalOpen}
          onClose={() => setPlaygroundModalOpen(false)}
          repoOwner={repoName?.split('/')[0] || ''}
          repoName={repoName?.split('/')[1] || ''}
        />
      )}
    </div>
  );
};

export default AgentCard;
