import type { Rule } from '../../types/index.js';

const AD_SDK_PATTERNS = [
  /react-native-google-mobile-ads|@react-native-firebase\/admob/i,
  /google-mobile-ads|GADMobileAds|GADBannerView/i,
  /react-native-fbads|FBAdView|FBInterstitialAd/i,
  /AdSupport|ASIdentifierManager|IDFA/i,
  /react-native-admob|AdMobBanner|AdMobInterstitial/i,
  /expo-ads-admob|expo-ads-facebook/i,
];

const ATT_PATTERNS = [
  /requestTrackingAuthorization/i,
  /ATTrackingManager/i,
  /expo-tracking-transparency/i,
  /AppTrackingTransparency/i,
  /trackingAuthorizationStatus/i,
];

export const missingAttConsent: Rule = {
  meta: {
    id: 'privacy/missing-att-consent',
    title: 'Missing ATT Consent',
    description:
      'App uses ad/tracking SDKs but does not request App Tracking Transparency authorization. Apple requires an ATT prompt before accessing IDFA.',
    severity: 'error',
    category: 'privacy',
    fixable: true,
  },

  check(context) {
    const violations = [];
    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    const usesAdSdk = AD_SDK_PATTERNS.some((p) => p.test(allSource));
    if (!usesAdSdk) return { violations: [] };

    const hasAtt = ATT_PATTERNS.some((p) => p.test(allSource));
    if (!hasAtt) {
      const adFiles = context.sourceFiles
        .filter((f) => AD_SDK_PATTERNS.some((p) => p.test(f.content)))
        .map((f) => f.path);

      violations.push({
        message:
          'App uses ad/tracking SDKs but no App Tracking Transparency (ATT) consent dialog was found. Since iOS 14.5, Apple requires apps to request permission via ATTrackingManager before accessing the IDFA.',
        fix: {
          prompt: `Add an App Tracking Transparency consent dialog that runs before any ad or tracking code. Use ATTrackingManager.requestTrackingAuthorization (or expo-tracking-transparency for Expo projects) to show the system prompt. Only initialize ad SDKs after the user responds. Add an NSUserTrackingUsageDescription key to Info.plist explaining why tracking is needed.`,
          files: [
            ...(context.project.infoPlistPath
              ? [context.project.infoPlistPath]
              : []),
            ...adFiles.slice(0, 4),
          ],
        },
      });
    }

    return { violations };
  },
};
