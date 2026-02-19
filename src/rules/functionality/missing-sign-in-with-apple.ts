import type { Rule } from '../../types/index.js';

const SOCIAL_LOGIN_PATTERNS = [
  /GoogleSignin|@react-native-google-signin|google-signin/i,
  /LoginManager.*facebook|FacebookLogin|react-native-fbsdk/i,
  /TWTRSession|TwitterKit|react-native-twitter-signin/i,
  /expo-auth-session.*google|expo-auth-session.*facebook/i,
  /signInWithCredential.*google|signInWithCredential.*facebook/i,
  /GIDSignIn|GIDConfiguration/i,
  /FBSDKLoginKit|FBSDKLoginManager/i,
];

const APPLE_AUTH_PATTERNS = [
  /ASAuthorizationAppleIDProvider/i,
  /@invertase\/react-native-apple-authentication/i,
  /expo-apple-authentication/i,
  /react-native-apple-sign-in/i,
  /appleAuth|AppleButton|performAppleSignIn/i,
  /SignInWithApple|signInWithApple/,
];

export const missingSignInWithApple: Rule = {
  meta: {
    id: 'functionality/missing-sign-in-with-apple',
    title: 'Missing Sign in with Apple',
    description:
      'App uses third-party social login but does not offer Sign in with Apple. Apple requires it when other social login options are present.',
    severity: 'error',
    category: 'functionality',
    fixable: true,
  },

  check(context) {
    const violations = [];
    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    const hasSocialLogin = SOCIAL_LOGIN_PATTERNS.some((p) =>
      p.test(allSource),
    );
    if (!hasSocialLogin) return { violations: [] };

    const hasAppleAuth = APPLE_AUTH_PATTERNS.some((p) => p.test(allSource));
    if (!hasAppleAuth) {
      const loginFiles = context.sourceFiles
        .filter((f) => SOCIAL_LOGIN_PATTERNS.some((p) => p.test(f.content)))
        .map((f) => f.path);

      violations.push({
        message:
          'App offers third-party social login (Google, Facebook, etc.) but does not provide Sign in with Apple. Apple requires Sign in with Apple when other social login options are available.',
        fix: {
          prompt: `Add Sign in with Apple alongside the existing social login options. Use @invertase/react-native-apple-authentication (or expo-apple-authentication for Expo projects). Place the Apple sign-in button prominently with the other login buttons. Handle the authorization response and integrate with your existing auth flow.`,
          files: loginFiles.slice(0, 5),
        },
      });
    }

    return { violations };
  },
};
