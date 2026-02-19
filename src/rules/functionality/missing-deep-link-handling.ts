import type { Rule } from '../../types/index.js';

const LINKING_HANDLER_PATTERNS = [
  /Linking\.addEventListener/,
  /Linking\.getInitialURL/,
  /useURL|useLinking/,
  /expo-linking.*useURL/,
  /NavigationContainer.*linking\s*=/,
  /createURL|parse.*deepLink/i,
  /react-navigation.*linking/i,
];

export const missingDeepLinkHandling: Rule = {
  meta: {
    id: 'functionality/missing-deep-link-handling',
    title: 'Missing Deep Link Handling',
    description:
      'App registers URL schemes in Info.plist but no Linking handler was found in the source code.',
    severity: 'warning',
    category: 'functionality',
    fixable: true,
  },

  check(context) {
    const violations = [];

    if (!context.plist || context.plist.urlSchemes.length === 0) {
      return { violations: [] };
    }

    const allSource = context.sourceFiles.map((f) => f.content).join('\n');
    const hasLinkingHandler = LINKING_HANDLER_PATTERNS.some((p) => p.test(allSource));

    if (!hasLinkingHandler) {
      violations.push({
        message: `App registers URL schemes (${context.plist.urlSchemes.join(', ')}) but no deep link handler was found. Unhandled deep links may cause crashes or blank screens during App Review.`,
        file: context.project.infoPlistPath ?? undefined,
        fix: {
          prompt: `Add deep link handling for the registered URL schemes: ${context.plist.urlSchemes.join(', ')}. Use React Navigation's linking configuration or React Native's Linking API to handle incoming URLs. Make sure to handle both cold start (Linking.getInitialURL) and warm start (Linking.addEventListener) scenarios.`,
          files: context.sourceFiles
            .filter((f) => /App\.(tsx?|jsx?)$/.test(f.path) || /navigation/i.test(f.path))
            .map((f) => f.path)
            .slice(0, 5),
        },
      });
    }

    return { violations };
  },
};
