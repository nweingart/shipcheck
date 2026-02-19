import { relative } from 'node:path';
import type { ScanResult } from '../engine/runner.js';
import type { Severity } from '../types/index.js';

const ghLevel: Record<Severity, string> = {
  error: 'error',
  warning: 'warning',
  info: 'notice',
};

/**
 * Format results as GitHub Actions workflow commands (annotations).
 * @see https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions
 */
export function formatGitHub(result: ScanResult): string {
  const lines: string[] = [];

  for (const run of result.runs) {
    const severity = run.rule.meta.severity;
    const level = ghLevel[severity];

    for (const violation of run.result.violations) {
      const file = violation.file
        ? relative(result.context.project.rootDir, violation.file)
        : '';
      const line = violation.line ? `,line=${violation.line}` : '';
      const title = run.rule.meta.title;

      lines.push(`::${level} file=${file}${line},title=${title}::${violation.message} [${run.rule.meta.id}]`);
    }
  }

  return lines.join('\n');
}
