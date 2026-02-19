import chalk from 'chalk';
import type { ScanResult } from '../engine/runner.js';
import type { Severity } from '../types/index.js';

const severityIcon: Record<Severity, string> = {
  error: chalk.red('✖'),
  warning: chalk.yellow('⚠'),
  info: chalk.blue('ℹ'),
};

const severityLabel: Record<Severity, (s: string) => string> = {
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};

export function formatText(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(chalk.bold(`shipcheck — React Native iOS App Store Scanner`));
  lines.push(chalk.dim(`Scanning ${result.context.project.rootDir}`));
  lines.push('');

  let totalViolations = 0;

  for (const run of result.runs) {
    if (run.result.violations.length === 0) continue;

    const severity = run.rule.meta.severity;

    for (const violation of run.result.violations) {
      totalViolations++;
      const icon = severityIcon[severity];
      const ruleId = chalk.dim(`[${run.rule.meta.id}]`);
      const fixable = run.rule.meta.fixable ? chalk.green(' (fixable)') : '';

      lines.push(`  ${icon} ${violation.message} ${ruleId}${fixable}`);

      if (violation.file) {
        lines.push(`    ${chalk.dim('at')} ${chalk.underline(violation.file)}${violation.line ? `:${violation.line}` : ''}`);
      }
    }
  }

  if (totalViolations === 0) {
    lines.push(chalk.green('  ✓ No issues found! Ship it! 🚀'));
  }

  lines.push('');

  // Summary
  const parts: string[] = [];
  if (result.errorCount > 0) parts.push(chalk.red(`${result.errorCount} error${result.errorCount !== 1 ? 's' : ''}`));
  if (result.warningCount > 0) parts.push(chalk.yellow(`${result.warningCount} warning${result.warningCount !== 1 ? 's' : ''}`));
  if (result.infoCount > 0) parts.push(chalk.blue(`${result.infoCount} info`));

  if (parts.length > 0) {
    lines.push(`  ${parts.join(', ')}`);

    const fixableCount = result.runs
      .filter((r) => r.rule.meta.fixable && r.result.violations.length > 0)
      .reduce((sum, r) => sum + r.result.violations.length, 0);

    if (fixableCount > 0) {
      lines.push(`  ${chalk.green(`${fixableCount} fixable with \`shipcheck fix\``)}`);
    }
  }

  lines.push('');

  return lines.join('\n');
}
