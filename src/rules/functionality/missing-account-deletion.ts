import type { Rule } from '../../types/index.js';

const AUTH_PATTERNS = [
  /signUp|sign_up|createAccount|createUser|register/i,
  /firebase.*auth|Auth\.createUser/i,
  /supabase.*auth.*signUp/i,
  /clerk|@clerk\/expo/i,
  /auth0/i,
  /cognito.*signUp/i,
];

const DELETION_PATTERNS = [
  /deleteAccount|delete_account|removeAccount|destroyAccount/i,
  /deleteUser|delete_user|removeUser/i,
  /accountDeletion|account_deletion/i,
  /deactivateAccount|deactivate_account/i,
  /\.delete\(\).*user|user.*\.delete\(\)/i,
];

export const missingAccountDeletion: Rule = {
  meta: {
    id: 'functionality/missing-account-deletion',
    title: 'Missing Account Deletion',
    description:
      'App has account creation but no account deletion flow. Apple requires apps with accounts to offer account deletion.',
    severity: 'error',
    category: 'functionality',
    fixable: true,
  },

  check(context) {
    const violations = [];
    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    const hasAuth = AUTH_PATTERNS.some((p) => p.test(allSource));
    if (!hasAuth) return { violations: [] };

    const hasDeletion = DELETION_PATTERNS.some((p) => p.test(allSource));
    if (!hasDeletion) {
      const authFiles = context.sourceFiles
        .filter((f) => AUTH_PATTERNS.some((p) => p.test(f.content)))
        .map((f) => f.path);

      violations.push({
        message:
          'App has account creation/signup functionality but no account deletion flow was found. Since June 2022, Apple requires all apps with account creation to offer account deletion.',
        fix: {
          prompt: `Add an account deletion feature to the app. This should include:
1. A "Delete Account" button in the app's settings or profile screen
2. A confirmation dialog warning the user that this action is irreversible
3. A call to the backend/auth service to delete the user's account and data
4. Proper cleanup of local data and navigation back to the sign-in screen
Look at the existing auth implementation to determine the correct deletion API to call.`,
          files: authFiles.slice(0, 5),
        },
      });
    }

    return { violations };
  },
};
