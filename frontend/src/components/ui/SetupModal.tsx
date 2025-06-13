import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Agent } from '../../types/agent';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, agent }) => {
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

  const showDevinScreenshots = agent.id === 'devin';

  const modalContent = (
    <div className="fullscreen-modal-overlay" onClick={handleOverlayClick}>
      <div className="fullscreen-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="fullscreen-modal-header">
          <h2 className="fullscreen-modal-title">Setup Guide: {agent.name}</h2>
          <div className="modal-close-section">
            <span className="modal-close-tip">Press ESC to close</span>
            <button className="fullscreen-modal-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="fullscreen-modal-content">
          <div className="setup-modal-content">
            {agent.prerequisites && agent.prerequisites.length > 0 && (
              <div className="setup-section">
                <h3 className="setup-section-title">Prerequisites</h3>
                <ul className="setup-prerequisites">
                  {agent.prerequisites.map((prereq, index) => {
                    // Check if the prerequisite contains a URL
                    const urlMatch = prereq.match(/(https?:\/\/[^\s]+)/);
                    if (urlMatch) {
                      const url = urlMatch[1];
                      const text = prereq.replace(url, '').replace(':', '').trim();
                      return (
                        <li key={index} className="setup-prerequisite-item">
                          <strong>{text}:</strong>{' '}
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="setup-link"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            {url} <span className="external-link-icon">↗</span>
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={index} className="setup-prerequisite-item">
                        {prereq}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {agent.setupSteps && agent.setupSteps.length > 0 && (
              <div className="setup-section">
                <h3 className="setup-section-title">Setup Steps</h3>
                <div className="setup-steps">
                  {agent.setupSteps.map((step, index) => (
                    <div key={index} className="setup-step">
                      <div className="setup-step-number">{index + 1}</div>
                      <div className="setup-step-content">
                        <h4 className="setup-step-title">{step.title}</h4>
                        <p className="setup-step-description">{step.description}</p>
                        
                        {/* Show Devin screenshots for specific steps */}
                        {showDevinScreenshots && step.title === 'Set up New Repository' && (
                          <div className="setup-step-screenshots">
                            <div className="screenshot-container">
                              <img 
                                src="/devin-template-button.png" 
                                alt="Devin From Template Button" 
                                className="setup-screenshot"
                              />
                              <p className="screenshot-caption">Click on "+ From Template" to create a new project</p>
                            </div>
                          </div>
                        )}
                        
                        {showDevinScreenshots && step.title === 'Choose Project Type' && (
                          <div className="setup-step-screenshots">
                            <div className="screenshot-container">
                              <img 
                                src="/devin-project-types.png" 
                                alt="Devin Project Types" 
                                className="setup-screenshot"
                              />
                              <p className="screenshot-caption">Select Frontend, Backend, or Fullstack project type</p>
                            </div>
                          </div>
                        )}
                        
                        {step.links && step.links.length > 0 && (
                          <div className="setup-step-links">
                            {step.links.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="setup-link"
                              >
                                {link.text} <span className="external-link-icon">↗</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="setup-actions">
              <button className="setup-btn primary" onClick={onClose}>
                Got it
              </button>
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="setup-btn secondary"
              >
                Visit Official Site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal outside the main component tree
  const modalPortal = document.getElementById('modal-portal');
  return modalPortal ? createPortal(modalContent, modalPortal) : null;
};

export default SetupModal;
