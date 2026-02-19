import type { Rule } from '../../types/index.js';

const SECRET_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/, label: 'Stripe live secret key' },
  { pattern: /sk_test_[a-zA-Z0-9]{20,}/, label: 'Stripe test secret key' },
  { pattern: /AIza[0-9A-Za-z_-]{35}/, label: 'Google API key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub personal access token' },
  { pattern: /AKIA[0-9A-Z]{16}/, label: 'AWS access key ID' },
  {
    pattern: /Bearer\s+ey[a-zA-Z0-9._-]{20,}/,
    label: 'Hardcoded Bearer token',
  },
  {
    pattern:
      /(?:api[_-]?key|apikey|api[_-]?secret|secret[_-]?key)\s*[:=]\s*["'][a-zA-Z0-9_\-/.]{16,}["']/i,
    label: 'API key/secret assignment',
  },
  {
    pattern:
      /(?:password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i,
    label: 'Hardcoded password',
  },
];

// Files that commonly contain example/config values we should skip
const IGNORE_FILE_PATTERNS = [
  /\.example$/,
  /\.sample$/,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /__tests__/,
  /\.md$/,
];

export const hardcodedSecrets: Rule = {
  meta: {
    id: 'security/hardcoded-secrets',
    title: 'Hardcoded Secrets',
    description:
      'Source files contain hardcoded API keys, tokens, or secrets that could be leaked in the app bundle.',
    severity: 'warning',
    category: 'security',
    fixable: true,
  },

  check(context) {
    const violations = [];

    for (const file of context.sourceFiles) {
      if (IGNORE_FILE_PATTERNS.some((p) => p.test(file.path))) continue;

      for (const { pattern, label } of SECRET_PATTERNS) {
        if (pattern.test(file.content)) {
          violations.push({
            message: `Found ${label} in source file. Secrets should not be hardcoded in source code.`,
            file: file.path,
            fix: {
              prompt: `Extract the hardcoded secret (${label}) from this file into an environment variable. Use react-native-config (or expo-constants for Expo projects) to load secrets from a .env file at build time. Add the .env file to .gitignore if not already excluded.`,
              files: [file.path],
            },
          });
          break; // One violation per file
        }
      }
    }

    return { violations };
  },
};
