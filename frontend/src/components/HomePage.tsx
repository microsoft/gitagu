import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { AgentCategory } from '../types/agent';
import agents from '../data/agents';
import AgentCard from './AgentCard';
import logo from '../assets/logo.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [repoInput, setRepoInput] = useState('');
  const [starCount, setStarCount] = useState<number | null>(null);

  const analyzeRepo = () => {
    const value = repoInput.trim();
    if (!value) {
      alert('Please enter a GitHub repository URL or owner/repo format');
      return;
    }

    let owner: string | undefined;
    let repo: string | undefined;

    if (value.includes('github.com')) {
      const match = value.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace('.git', '');
      }
    } else if (value.includes('/')) {
      [owner, repo] = value.split('/');
    }

    if (owner && repo) navigate(`/${owner}/${repo}`);
    else alert('Invalid repository format. Use owner/repo or a GitHub URL');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') analyzeRepo();
  };

  const [activeCategory, setActiveCategory] =
    useState<AgentCategory>('all');
  const filteredAgents = agents.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory
  );

  /* fetch GitHub star count */
  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/microsoft/gitagu');
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.log('Failed to fetch star count:', error);
      }
    };

    fetchStarCount();
  }, []);

  /* smooth-scroll + nav shadow */
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'A' && t.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = t.getAttribute('href')!.substring(1);
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };
    const handleScroll = () => {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) {
        if (window.scrollY > 50) {
          nav.style.background = 'rgba(31,31,31,1)';
          nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
        } else {
          nav.style.background = 'rgba(31,31,31,0.98)';
          nav.style.boxShadow = 'none';
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="bg-animation" />

      {/* ---------- NAV ---------- */}
      <nav>
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="gitagu home">
            <img src={logo} alt="gitagu logo" className="logo-img" />
          </Link>

          <div className="nav-links">
            <a href="#agents">Agents</a>
            <a href="#integration">Ecosystem</a>
            <a
              href="https://github.com/microsoft/gitagu"
              className="github-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              microsoft/gitagu {starCount && `⭐ ${starCount}`}
            </a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-content">
          
          <h1 className="hero-title">Onboarding Agent to turbocharge SDLC</h1>
          
          <div className="hero-input-section">
            <div className="repo-input-container-hero">
              <input
                type="text"
                className="repo-input-hero"
                placeholder="Enter owner/repo (e.g., microsoft/vscode)"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="analyze-btn-hero" onClick={analyzeRepo}>
                Get Setup Guide
              </button>
            </div>

            <div className="hero-try-section">
              <span className="hero-try-label">Try:</span>
              <span
                className="hero-try-example-link"
                onClick={() => setRepoInput('Azure-Samples/snippy')}
              >
                Azure-Samples/snippy
              </span>
            </div>
            
            {/* Animated URL transformation */}
            <div className="url-animation-demo">
              <span className="url-demo-text">
                Replace hub with agu: git<span className="animated-domain-single"></span>.com/owner/repo
              </span>
            </div>
            
           
          </div>
        </div>
      </section>

      {/* ---------- AGENT CATEGORIES ---------- */}
      <section className="categories" id="agents">
        <div className="categories-content">
          <h2 className="section-title">Agents by Category</h2>
          <p className="section-subtitle">
            Find the perfect SDLC agent for each stage of your development lifecycle
          </p>

          <div className="category-tabs">
            {(['all', 'code-completion', 'async-swe', 'cli', 'devops'] as const).map(
              (cat) => (
                <div
                  key={cat}
                  className={`category-tab ${
                    activeCategory === cat ? 'active' : ''
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all'
                    ? 'All Agents'
                    : cat === 'code-completion'
                    ? 'Code Completion Agent'
                    : cat === 'async-swe'
                    ? 'Async SWE Agent'
                    : cat === 'cli'
                    ? 'CLI-based Sync Agent'
                    : 'DevOps Agent'}
                </div>
              )
            )}
          </div>

          <div className="agents-grid">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INTEGRATION STRIP ---------- */}
      <section className="integration" id="integration">
        <div className="integration-content">
          <h2 className="section-title">Microsoft Ecosystem Integration</h2>
          <p className="section-subtitle">
            Leverage the full power of Microsoft's AI and cloud services for your development workflow
          </p>

          <div className="integration-grid">
            <div className="integration-item">
              <div className="integration-icon">☁️</div>
              <h3>Azure Integration</h3>
              <p>
                Deploy agents via Azure Marketplace or use Azure AI Foundry for
                custom implementations
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">📦</div>
              <h3>GitHub Integration</h3>
              <p>
                Native support for GitHub repositories with Copilot and other
                agents
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">⚙️</div>
              <h3>DevOps Pipeline</h3>
              <p>
                Integrate agents into your CI/CD workflows for automated
                development
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🛡️</div>
              <h3>Enterprise Ready</h3>
              <p>
                Security, compliance, and governance features for enterprise
                deployments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <div className="footer-content">
          <p style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Microsoft Corporation. gitagu is an
            open source project, powered by Azure AI Foundry Agents Service.
          </p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
