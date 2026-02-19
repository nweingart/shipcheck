import { describe, it, expect } from 'vitest';
import { insecureTransport } from '../../src/rules/security/insecure-transport.js';
import type { RuleContext } from '../../src/types/index.js';

function makeContext(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    project: {
      rootDir: '/test',
      iosDir: '/test/ios',
      appName: 'TestApp',
      infoPlistPath: '/test/ios/TestApp/Info.plist',
      pbxprojPath: null,
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
    pbxproj: null,
    sourceFiles: [],
    packageJson: null,
    ...overrides,
  };
}

describe('security/insecure-transport', () => {
  it('flags when NSAllowsArbitraryLoads is true', () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: {},
        ats: { allowsArbitraryLoads: true },
        urlSchemes: [],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
    });
    const result = insecureTransport.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('NSAllowsArbitraryLoads');
  });

  it('does not flag when ATS is properly configured', () => {
    const ctx = makeContext();
    const result = insecureTransport.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});
