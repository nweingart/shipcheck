import type { Rule, RuleResult, RuleContext, ShipcheckConfig, Severity } from '../types/index.js';
import { allRules } from '../rules/index.js';
import { logger } from '../utils/logger.js';

export interface RuleRun {
  rule: Rule;
  result: RuleResult;
}

export interface ScanResult {
  runs: RuleRun[];
  context: RuleContext;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

function shouldRunRule(rule: Rule, config: ShipcheckConfig, filters: RunFilters): boolean {
  const override = config.rules?.[rule.meta.id];

  // Explicitly disabled
  if (override?.enabled === false) return false;

  // Rule ID filter (supports glob-like "privacy/*")
  if (filters.ruleFilter) {
    const pattern = filters.ruleFilter;
    if (pattern.endsWith('/*')) {
      const category = pattern.slice(0, -2);
      if (rule.meta.category !== category) return false;
    } else if (rule.meta.id !== pattern) {
      return false;
    }
  }

  // Severity filter
  if (filters.minSeverity) {
    const sevOrder: Record<Severity, number> = { error: 3, warning: 2, info: 1 };
    const effectiveSev = override?.severity ?? rule.meta.severity;
    if (sevOrder[effectiveSev] < sevOrder[filters.minSeverity]) return false;
  }

  return true;
}

export interface RunFilters {
  ruleFilter?: string;
  minSeverity?: Severity;
}

export async function runRules(
  context: RuleContext,
  config: ShipcheckConfig = {},
  filters: RunFilters = {},
): Promise<ScanResult> {
  const rules = allRules.filter((r) => shouldRunRule(r, config, filters));

  logger.debug(`Running ${rules.length} rules...`);

  const runs: RuleRun[] = [];

  // Run all rules in parallel
  const results = await Promise.allSettled(
    rules.map(async (rule): Promise<RuleRun> => {
      const result = await rule.check(context);
      return { rule, result };
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      runs.push(result.value);
    } else {
      logger.error(`Rule failed:`, result.reason);
    }
  }

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const run of runs) {
    const severity = config.rules?.[run.rule.meta.id]?.severity ?? run.rule.meta.severity;
    const count = run.result.violations.length;
    if (severity === 'error') errorCount += count;
    else if (severity === 'warning') warningCount += count;
    else infoCount += count;
  }

  return { runs, context, errorCount, warningCount, infoCount };
}
