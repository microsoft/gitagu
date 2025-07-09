import { Agent } from '../../types/agent';
import githubCopilotCompletions from './github-copilot-completions';
import githubCopilotAgent from './github-copilot-agent';
import devin from './devin';
import codexCli from './codex-cli';
import sreAgent from './sreagent';
import replit from './replit';

const agents: Agent[] = [
  githubCopilotCompletions,
  githubCopilotAgent,
  devin,
  replit,
  codexCli,
  sreAgent
];

export default agents;
