import type { Rule } from '../../types/index.js';

export const insecureTransport: Rule = {
  meta: {
    id: 'security/insecure-transport',
    title: 'Insecure Transport (ATS)',
    description:
      'NSAllowsArbitraryLoads is set to true in App Transport Security, allowing insecure HTTP connections.',
    severity: 'error',
    category: 'security',
    fixable: true,
  },

  check(context) {
    const violations = [];

    if (context.plist?.ats.allowsArbitraryLoads) {
      violations.push({
        message:
          'NSAllowsArbitraryLoads is true in NSAppTransportSecurity. This disables ATS and allows insecure HTTP connections. Apple may reject apps with this setting unless justified.',
        file: context.project.infoPlistPath ?? undefined,
        fix: {
          prompt: `Remove NSAllowsArbitraryLoads from NSAppTransportSecurity in Info.plist, or set it to false. If specific domains need HTTP access, use NSExceptionDomains to allowlist only those domains instead of disabling ATS globally. Check the app's network calls to identify any domains that still need HTTP, and add them as specific exceptions.`,
          files: [context.project.infoPlistPath!],
        },
      });
    }

    return { violations };
  },
};
