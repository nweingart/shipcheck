import { resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import type { Severity, RuleViolation } from '../types/index.js';
import { buildContext } from '../engine/context.js';
import { runRules } from '../engine/runner.js';
import { loadConfig } from '../config/loader.js';
import { detectAgent } from '../fixers/ai-agent.js';
import { buildPrompt } from '../fixers/prompt-builder.js';
import { invokeAgent } from '../fixers/ai-agent.js';
import type { AIAgent } from '../types/index.js';

export interface FixOptions {
  agent?: string;
  dryRun?: boolean;
  yes?: boolean;
  rule?: string;
  config?: string;
}

export async function fixCommand(dir: string | undefined, options: FixOptions): Promise<void> {
  const rootDir = resolve(dir ?? '.');

  const spinner = ora('Scanning for fixable issues...').start();

  try {
    const config = await loadConfig(rootDir, options.config);
    const context = await buildContext(rootDir, config);
    const result = await runRules(context, config, {
      ruleFilter: options.rule,
    });

    // Collect fixable violations
    const fixable: { ruleId: string; violation: RuleViolation }[] = [];
    for (const run of result.runs) {
      if (!run.rule.meta.fixable) continue;
      for (const v of run.result.violations) {
        if (v.fix) {
          fixable.push({ ruleId: run.rule.meta.id, violation: v });
        }
      }
    }

    if (fixable.length === 0) {
      spinner.succeed('No fixable issues found.');
      return;
    }

    spinner.stop();

    console.log('');
    console.log(chalk.bold(`  Found ${fixable.length} fixable issue${fixable.length !== 1 ? 's' : ''}:`));
    console.log('');

    for (const { ruleId, violation } of fixable) {
      console.log(`  ${chalk.yellow('⚡')} ${violation.message} ${chalk.dim(`[${ruleId}]`)}`);
    }
    console.log('');

    if (options.dryRun) {
      console.log(chalk.dim('  Dry run — no changes made.'));
      console.log('');

      // Show the prompts that would be sent
      for (const { ruleId, violation } of fixable) {
        console.log(chalk.bold(`  Prompt for ${ruleId}:`));
        console.log(chalk.dim(`  ${violation.fix!.prompt}`));
        console.log('');
      }
      return;
    }

    // Detect AI agent
    const agentPref = (options.agent ?? config.agent ?? 'auto') as 'claude' | 'codex' | 'auto';
    const agent = await detectAgent(agentPref);

    if (!agent) {
      console.log(chalk.red('  No AI coding CLI found on PATH.'));
      console.log(chalk.dim('  Install Claude Code (claude) or Codex CLI (codex) and try again.'));
      process.exitCode = 1;
      return;
    }

    console.log(`  Using ${chalk.bold(agent.name)} at ${chalk.dim(agent.path)}`);
    console.log('');

    if (!options.yes) {
      console.log(chalk.yellow('  This will invoke the AI agent to modify your code.'));
      console.log(chalk.dim('  Use --yes to skip this confirmation, or --dry-run to preview.'));
      console.log('');
      // In a real CLI we'd use readline for confirmation, but for v0.1 we require --yes
      console.log(chalk.dim('  Re-run with --yes to proceed.'));
      return;
    }

    // Fix each violation
    for (const { ruleId, violation } of fixable) {
      const fixSpinner = ora(`Fixing ${ruleId}...`).start();

      const prompt = buildPrompt(violation, ruleId, rootDir);
      const agentResult = await invokeAgent(agent, prompt, rootDir);

      if (agentResult.success) {
        fixSpinner.succeed(`Fixed ${ruleId}`);
      } else {
        fixSpinner.fail(`Failed to fix ${ruleId}: ${agentResult.output.slice(0, 200)}`);
      }
    }

    console.log('');
    console.log(chalk.green('  Done! Re-run `shipcheck` to verify fixes.'));
    console.log('');
  } catch (error) {
    spinner.fail((error as Error).message);
    process.exitCode = 1;
  }
}
