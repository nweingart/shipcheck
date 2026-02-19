#!/usr/bin/env node

import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { fixCommand } from './commands/fix.js';
import { listRulesCommand } from './commands/list-rules.js';
import { setLogLevel } from './utils/logger.js';

const program = new Command();

program
  .name('shipcheck')
  .description('Scan React Native iOS projects for common App Store rejection issues')
  .version('0.1.0');

// Default command: scan
program
  .command('scan', { isDefault: true })
  .description('Scan project for App Store issues')
  .argument('[dir]', 'Project directory', '.')
  .option('--rule <id>', 'Filter rules (e.g. "privacy/*")')
  .option('--severity <level>', 'Minimum severity: error, warning, info')
  .option('--format <type>', 'Output format: text, json, github', 'text')
  .option('--config <path>', 'Config file path')
  .option('--verbose', 'Enable debug logging')
  .action(async (dir, options) => {
    if (options.verbose) setLogLevel('debug');
    await scanCommand(dir, options);
  });

// Fix command
program
  .command('fix')
  .description('Auto-fix issues using local AI coding CLI')
  .argument('[dir]', 'Project directory', '.')
  .option('--agent <name>', 'AI agent: claude, codex, auto', 'auto')
  .option('--dry-run', 'Show what would be fixed without invoking AI')
  .option('--yes', 'Skip confirmation prompt')
  .option('--rule <id>', 'Fix only specific rule(s)')
  .option('--config <path>', 'Config file path')
  .option('--verbose', 'Enable debug logging')
  .action(async (dir, options) => {
    if (options.verbose) setLogLevel('debug');
    await fixCommand(dir, options);
  });

// List rules command
program
  .command('list-rules')
  .description('List all available rules')
  .option('--category <name>', 'Filter by category')
  .option('--fixable', 'Show only AI-fixable rules')
  .action((options) => {
    listRulesCommand(options);
  });

program.parse();
