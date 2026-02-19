import type { RuleViolation } from '../types/index.js';

export function buildPrompt(
  violation: RuleViolation,
  ruleId: string,
  rootDir: string,
): string {
  const fix = violation.fix!;

  const fileList = fix.files
    .map((f) => `- ${f}`)
    .join('\n');

  return `You are fixing an App Store compliance issue in a React Native iOS project at "${rootDir}".

Issue: ${violation.message}
Rule: ${ruleId}

${fix.prompt}

Relevant files:
${fileList}

Instructions:
- Only modify the files necessary to fix this specific issue
- Do not introduce new dependencies
- Follow existing code style and conventions
- Make the minimal change needed to resolve the issue`;
}
