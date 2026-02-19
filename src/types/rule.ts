import type { RuleContext } from './context.js';

export type Severity = 'error' | 'warning' | 'info';

export interface FixHint {
  prompt: string;
  files: string[];
}

export interface RuleViolation {
  message: string;
  file?: string;
  line?: number;
  fix?: FixHint;
}

export interface RuleResult {
  violations: RuleViolation[];
}

export interface RuleMeta {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  fixable: boolean;
}

export interface Rule {
  meta: RuleMeta;
  check(context: RuleContext): RuleResult | Promise<RuleResult>;
}
