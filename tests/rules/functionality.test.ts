import { describe, it, expect } from 'vitest';
import { missingAccountDeletion } from '../../src/rules/functionality/missing-account-deletion.js';
import { missingDeepLinkHandling } from '../../src/rules/functionality/missing-deep-link-handling.js';
import { minimumOsVersion } from '../../src/rules/functionality/minimum-os-version.js';
import type { RuleContext } from '../../src/types/index.js';

function makeContext(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    project: {
      rootDir: '/test',
      iosDir: '/test/ios',
      appName: 'TestApp',
      infoPlistPath: '/test/ios/TestApp/Info.plist',
      pbxprojPath: '/test/ios/TestApp.xcodeproj/project.pbxproj',
      podfileLockPath: null,
      privacyManifestPath: null,
    },
    plist: {
      raw: {},
      purposeStrings: {},
      ats: {},
      urlSchemes: [],
      bundleVersion: '1',
      bundleShortVersion: '1.0.0',
    },
    pbxproj: { raw: '', marketingVersion: '1.0.0', deploymentTarget: '15.0', appIconName: 'AppIcon' },
    sourceFiles: [],
    packageJson: null,
    ...overrides,
  };
}

describe('functionality/missing-account-deletion', () => {
  it('flags when auth exists but no account deletion', () => {
    const ctx = makeContext({
      sourceFiles: [{ path: '/test/src/Auth.tsx', content: 'const signUp = () => { createAccount(email); }' }],
    });
    const result = missingAccountDeletion.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('account deletion');
  });

  it('does not flag when both auth and deletion exist', () => {
    const ctx = makeContext({
      sourceFiles: [{
        path: '/test/src/Auth.tsx',
        content: 'const signUp = () => {}; const deleteAccount = () => {};',
      }],
    });
    const result = missingAccountDeletion.check(ctx);
    expect(result.violations).toHaveLength(0);
  });

  it('does not flag when no auth exists', () => {
    const ctx = makeContext({
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'console.log("hello");' }],
    });
    const result = missingAccountDeletion.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});

describe('functionality/missing-deep-link-handling', () => {
  it('flags when URL schemes registered but no handler', () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: {},
        ats: {},
        urlSchemes: ['myapp'],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'export default function App() {}' }],
    });
    const result = missingDeepLinkHandling.check(ctx);
    expect(result.violations).toHaveLength(1);
  });

  it('does not flag when Linking handler exists', () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: {},
        ats: {},
        urlSchemes: ['myapp'],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'Linking.addEventListener("url", handler);' }],
    });
    const result = missingDeepLinkHandling.check(ctx);
    expect(result.violations).toHaveLength(0);
  });

  it('does not flag when no URL schemes', () => {
    const ctx = makeContext();
    const result = missingDeepLinkHandling.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});

describe('functionality/minimum-os-version', () => {
  it('flags deployment target below 15', () => {
    const ctx = makeContext({
      pbxproj: { raw: '', marketingVersion: '1.0.0', deploymentTarget: '13.0', appIconName: 'AppIcon' },
    });
    const result = minimumOsVersion.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('13.0');
  });

  it('does not flag deployment target at or above 15', () => {
    const ctx = makeContext({
      pbxproj: { raw: '', marketingVersion: '1.0.0', deploymentTarget: '16.0', appIconName: 'AppIcon' },
    });
    const result = minimumOsVersion.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});
