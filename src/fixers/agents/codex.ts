import type { AgentAdapter } from './types.js';

export const codexAdapter: AgentAdapter = {
  buildCommand(prompt: string, cwd: string) {
    return {
      command: 'codex',
      args: [
        'exec',
        '--full-auto',
        prompt,
      ],
    };
  },
};
