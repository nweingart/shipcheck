import type { Rule } from '../types/index.js';
import { missingPurposeStrings } from './privacy/missing-purpose-strings.js';
import { missingPrivacyManifest } from './privacy/missing-privacy-manifest.js';
import { overbroadPermissions } from './privacy/overbroad-permissions.js';
import { missingAttConsent } from './privacy/missing-att-consent.js';
import { missingIcons } from './metadata/missing-icons.js';
import { versionMismatch } from './metadata/version-mismatch.js';
import { missingLaunchScreen } from './metadata/missing-launch-screen.js';
import { missingRestorePurchases } from './payments/missing-restore-purchases.js';
import { externalPaymentLinks } from './payments/external-payment-links.js';
import { insecureTransport } from './security/insecure-transport.js';
import { hardcodedSecrets } from './security/hardcoded-secrets.js';
import { missingAccountDeletion } from './functionality/missing-account-deletion.js';
import { missingDeepLinkHandling } from './functionality/missing-deep-link-handling.js';
import { minimumOsVersion } from './functionality/minimum-os-version.js';
import { missingSignInWithApple } from './functionality/missing-sign-in-with-apple.js';
import { webviewOnly } from './functionality/webview-only.js';

export const allRules: Rule[] = [
  missingPurposeStrings,
  missingPrivacyManifest,
  overbroadPermissions,
  missingAttConsent,
  missingIcons,
  versionMismatch,
  missingLaunchScreen,
  missingRestorePurchases,
  externalPaymentLinks,
  insecureTransport,
  hardcodedSecrets,
  missingAccountDeletion,
  missingDeepLinkHandling,
  minimumOsVersion,
  missingSignInWithApple,
  webviewOnly,
];
