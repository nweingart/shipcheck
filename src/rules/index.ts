import type { Rule } from '../types/index.js';
import { missingPurposeStrings } from './privacy/missing-purpose-strings.js';
import { missingPrivacyManifest } from './privacy/missing-privacy-manifest.js';
import { overbroadPermissions } from './privacy/overbroad-permissions.js';
import { missingIcons } from './metadata/missing-icons.js';
import { versionMismatch } from './metadata/version-mismatch.js';
import { missingRestorePurchases } from './payments/missing-restore-purchases.js';
import { insecureTransport } from './security/insecure-transport.js';
import { missingAccountDeletion } from './functionality/missing-account-deletion.js';
import { missingDeepLinkHandling } from './functionality/missing-deep-link-handling.js';
import { minimumOsVersion } from './functionality/minimum-os-version.js';

export const allRules: Rule[] = [
  missingPurposeStrings,
  missingPrivacyManifest,
  overbroadPermissions,
  missingIcons,
  versionMismatch,
  missingRestorePurchases,
  insecureTransport,
  missingAccountDeletion,
  missingDeepLinkHandling,
  minimumOsVersion,
];
