import { describe, it, expect } from 'vitest';
import { missingRestorePurchases } from '../../src/rules/payments/missing-restore-purchases.js';
import type { RuleContext } from '../../src/types/index.js';

function makeContext(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    project: {
      rootDir: '/test',
      iosDir: '/test/ios',
      appName: 'TestApp',
      infoPlistPath: null,
      pbxprojPath: null,
      podfileLockPath: null,
      privacyManifestPath: null,
    },
    plist: null,
    pbxproj: null,
    sourceFiles: [],
    packageJson: null,
    ...overrides,
  };
}

describe('payments/missing-restore-purchases', () => {
  it('flags when IAP is used but no restore call', () => {
    const ctx = makeContext({
      sourceFiles: [{
        path: '/test/src/Purchase.tsx',
        content: 'import RNIap from "react-native-iap"; RNIap.requestPurchase(sku);',
      }],
    });
    const result = missingRestorePurchases.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('restore');
  });

  it('does not flag when restore is present', () => {
    const ctx = makeContext({
      sourceFiles: [{
        path: '/test/src/Purchase.tsx',
        content: 'import RNIap from "react-native-iap"; RNIap.requestPurchase(sku); RNIap.getAvailablePurchases();',
      }],
    });
    const result = missingRestorePurchases.check(ctx);
    expect(result.violations).toHaveLength(0);
  });

  it('does not flag when no IAP usage', () => {
    const ctx = makeContext({
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'console.log("no payments");' }],
    });
    const result = missingRestorePurchases.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});
