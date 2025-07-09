import { Agent } from '../../types/agent';

const replit: Agent = {
  id: 'replit',
  name: 'Replit Agent',
  description:
    'Coming soon: AI-powered collaborative coding environment that can write, run, and deploy code directly in your browser. Perfect for rapid prototyping and development.',
  provider: 'Replit',
  category: 'async-swe',
  url: 'https://replit.com',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Repl.it_logo.svg/1024px-Repl.it_logo.svg.png',
  getStarted: 'Coming soon to Azure Marketplace - Stay tuned for availability.',
  strengths: [
    'Browser-based development environment',
    'Real-time collaboration',
    'Instant deployment and hosting',
    'AI-powered code suggestions',
    'Multi-language support',
    'Integrated version control',
    'Live coding sessions',
    'Educational and prototyping focused'
  ],
  integration: 'Azure Marketplace (Coming Soon)',
  prerequisites: [
    'Replit account',
    'Web browser',
    'Basic understanding of coding concepts'
  ],
  setupSteps: [
    {
      title: 'Coming Soon to Azure Marketplace',
      description: 'Replit Agent integration is currently in development for Azure Marketplace. Check back soon for deployment and setup instructions.',
      links: [
        { text: 'Replit', url: 'https://replit.com' }
      ]
    }
  ],
  useCases: [
    'Rapid prototyping',
    'Educational coding projects',
    'Collaborative development',
    'Quick code experimentation',
    'Instant web app deployment',
    'Learning new programming languages',
    'Building and sharing demos'
  ],
  bestFor: [
    'Rapid prototyping and experimentation',
    'Educational and learning scenarios',
    'Quick collaborative coding sessions',
    'Instant deployment requirements',
    'Browser-based development workflows'
  ]
};

export default replit; 