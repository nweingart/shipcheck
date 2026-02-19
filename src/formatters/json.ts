import type { ScanResult } from '../engine/runner.js';

export function formatJson(result: ScanResult): string {
  const output = {
    project: {
      rootDir: result.context.project.rootDir,
      appName: result.context.project.appName,
      iosDir: result.context.project.iosDir,
    },
    summary: {
      errors: result.errorCount,
      warnings: result.warningCount,
      info: result.infoCount,
      total: result.errorCount + result.warningCount + result.infoCount,
    },
    results: result.runs
      .filter((r) => r.result.violations.length > 0)
      .map((r) => ({
        ruleId: r.rule.meta.id,
        title: r.rule.meta.title,
        severity: r.rule.meta.severity,
        fixable: r.rule.meta.fixable,
        violations: r.result.violations.map((v) => ({
          message: v.message,
          file: v.file ?? null,
          line: v.line ?? null,
          fix: v.fix
            ? { prompt: v.fix.prompt, files: v.fix.files }
            : null,
        })),
      })),
  };

  return JSON.stringify(output, null, 2);
}
