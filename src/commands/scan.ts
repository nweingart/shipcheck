import { resolve } from 'node:path';
import ora from 'ora';
import type { Severity } from '../types/index.js';
import { buildContext } from '../engine/context.js';
import { runRules } from '../engine/runner.js';
import { loadConfig } from '../config/loader.js';
import { formatText } from '../formatters/text.js';
import { formatJson } from '../formatters/json.js';
import { formatGitHub } from '../formatters/github.js';

export interface ScanOptions {
  rule?: string;
  severity?: string;
  format?: string;
  config?: string;
}

export async function scanCommand(dir: string | undefined, options: ScanOptions): Promise<void> {
  const rootDir = resolve(dir ?? '.');
  const format = options.format ?? 'text';

  const spinner = format === 'text' ? ora('Scanning project...').start() : null;

  try {
    const config = await loadConfig(rootDir, options.config);

    if (spinner) spinner.text = 'Detecting project structure...';
    const context = await buildContext(rootDir, config);

    if (spinner) spinner.text = `Running rules against ${context.project.appName}...`;
    const result = await runRules(context, config, {
      ruleFilter: options.rule,
      minSeverity: options.severity as Severity | undefined,
    });

    spinner?.stop();

    switch (format) {
      case 'json':
        console.log(formatJson(result));
        break;
      case 'github':
        console.log(formatGitHub(result));
        break;
      default:
        console.log(formatText(result));
    }

    // Exit with non-zero if there are errors
    if (result.errorCount > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    spinner?.fail((error as Error).message);
    process.exitCode = 1;
  }
}
