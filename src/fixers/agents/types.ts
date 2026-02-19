import type { AIAgent } from '../../types/index.js';

export interface AgentAdapter {
  buildCommand(prompt: string, cwd: string): { command: string; args: string[] };
}
