import type { AgentAdapter } from './types.js';

export const claudeAdapter: AgentAdapter = {
  buildCommand(prompt: string, cwd: string) {
    return {
      command: 'claude',
      args: [
        '-p',
        prompt,
        '--allowedTools',
        'Edit,Read,Write,Glob,Grep',
      ],
    };
  },
};
