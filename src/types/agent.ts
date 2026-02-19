import type { RuleViolation } from './rule.js';

export type AgentName = 'claude' | 'codex';

export interface AIAgent {
  name: AgentName;
  available: boolean;
  path: string;
}

export interface FixInvocation {
  agent: AIAgent;
  prompt: string;
  cwd: string;
}

export interface AgentResult {
  success: boolean;
  output: string;
  violation: RuleViolation;
}
