import type { AIAgent, AgentName, AgentResult } from '../types/index.js';
import { which } from '../utils/exec.js';
import { exec } from '../utils/exec.js';
import { claudeAdapter } from './agents/claude.js';
import { codexAdapter } from './agents/codex.js';
import { logger } from '../utils/logger.js';

const AGENT_PRIORITY: AgentName[] = ['claude', 'codex'];

const adapters = {
  claude: claudeAdapter,
  codex: codexAdapter,
} as const;

export async function detectAgent(
  preference: 'claude' | 'codex' | 'auto' = 'auto',
): Promise<AIAgent | null> {
  if (preference !== 'auto') {
    const path = await which(preference);
    if (path) {
      return { name: preference, available: true, path };
    }
    logger.warn(`Preferred agent "${preference}" not found on PATH`);
    return null;
  }

  // Auto-detect in priority order
  for (const name of AGENT_PRIORITY) {
    const path = await which(name);
    if (path) {
      return { name, available: true, path };
    }
  }

  return null;
}

export async function invokeAgent(
  agent: AIAgent,
  prompt: string,
  cwd: string,
): Promise<AgentResult> {
  const adapter = adapters[agent.name];
  const { command, args } = adapter.buildCommand(prompt, cwd);

  logger.debug(`Invoking ${agent.name}: ${command} ${args.join(' ').slice(0, 100)}...`);

  const result = await exec(command, args, {
    cwd,
    timeout: 300_000, // 5 minute timeout
  });

  const success = result.exitCode === 0;

  if (!success) {
    logger.debug(`Agent ${agent.name} exited with code ${result.exitCode}`);
    logger.debug(`stderr: ${result.stderr.slice(0, 500)}`);
  }

  return {
    success,
    output: result.stdout || result.stderr,
    violation: { message: '' }, // caller should set this
  };
}
