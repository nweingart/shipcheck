import type { Severity } from './rule.js';

export interface RuleOverride {
  enabled?: boolean;
  severity?: Severity;
}

export interface ShipcheckConfig {
  /** Path to ios/ directory (auto-detected if omitted) */
  iosDir?: string;
  /** Rule overrides keyed by rule ID */
  rules?: Record<string, RuleOverride>;
  /** Preferred AI agent */
  agent?: 'claude' | 'codex' | 'auto';
  /** Extra source globs to include */
  include?: string[];
  /** Globs to exclude from source scanning */
  exclude?: string[];
}
