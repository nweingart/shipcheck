import type { Rule } from '../../types/index.js';

const IAP_PATTERNS = [
  /react-native-iap/,
  /expo-in-app-purchases/,
  /react-native-purchases/,  // RevenueCat
  /RNIap/,
  /requestPurchase|buyProduct|purchaseProduct/,
  /initConnection.*react-native-iap/,
  /Purchases\.configure/,  // RevenueCat
];

const RESTORE_PATTERNS = [
  /restorePurchases|getAvailablePurchases|restoreTransactions/i,
  /Purchases\.restorePurchases/,
  /restore.*purchase/i,
];

export const missingRestorePurchases: Rule = {
  meta: {
    id: 'payments/missing-restore-purchases',
    title: 'Missing Restore Purchases',
    description:
      'App uses In-App Purchase APIs but no restore purchases functionality was found. Apple requires a restore button.',
    severity: 'error',
    category: 'payments',
    fixable: true,
  },

  check(context) {
    const violations = [];
    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    const usesIAP = IAP_PATTERNS.some((p) => p.test(allSource));
    if (!usesIAP) return { violations: [] };

    const hasRestore = RESTORE_PATTERNS.some((p) => p.test(allSource));
    if (!hasRestore) {
      // Find which files contain IAP usage
      const iapFiles = context.sourceFiles
        .filter((f) => IAP_PATTERNS.some((p) => p.test(f.content)))
        .map((f) => f.path);

      violations.push({
        message:
          'App uses In-App Purchase APIs but no restore purchases call was found. Apple requires apps with IAP to include a "Restore Purchases" button.',
        fix: {
          prompt: `Add a "Restore Purchases" button to the app's purchase/subscription UI. The button should call the appropriate restore function from the IAP library being used. For react-native-iap, use getAvailablePurchases(). For RevenueCat, use Purchases.restorePurchases(). Include proper error handling and loading state.`,
          files: iapFiles.slice(0, 5),
        },
      });
    }

    return { violations };
  },
};
