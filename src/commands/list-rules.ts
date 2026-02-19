import chalk from 'chalk';
import { allRules } from '../rules/index.js';
import type { Severity } from '../types/index.js';

export interface ListRulesOptions {
  category?: string;
  fixable?: boolean;
}

const severityColor: Record<Severity, (s: string) => string> = {
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};

export function listRulesCommand(options: ListRulesOptions): void {
  let rules = allRules;

  if (options.category) {
    rules = rules.filter((r) => r.meta.category === options.category);
  }

  if (options.fixable) {
    rules = rules.filter((r) => r.meta.fixable);
  }

  if (rules.length === 0) {
    console.log(chalk.dim('  No matching rules found.'));
    return;
  }

  console.log('');
  console.log(chalk.bold(`  Available Rules (${rules.length})`));
  console.log('');

  // Group by category
  const byCategory = new Map<string, typeof rules>();
  for (const rule of rules) {
    const cat = rule.meta.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(rule);
  }

  for (const [category, categoryRules] of byCategory) {
    console.log(`  ${chalk.bold.underline(category)}`);
    for (const rule of categoryRules) {
      const sev = severityColor[rule.meta.severity](rule.meta.severity.padEnd(7));
      const fix = rule.meta.fixable ? chalk.green(' ✦') : '  ';
      console.log(`    ${sev} ${rule.meta.id}${fix}`);
      console.log(`           ${chalk.dim(rule.meta.description)}`);
    }
    console.log('');
  }

  console.log(chalk.dim(`  ${chalk.green('✦')} = AI-fixable`));
  console.log('');
}
