import { describe, it, expect } from 'vitest';
import { runRules } from '../../src/engine/runner.js';
import type { RuleContext } from '../../src/types/index.js';

function makeContext(): RuleContext {
  return {
    project: {
      rootDir: '/test',
      iosDir: '/test/ios',
      appName: 'TestApp',
      infoPlistPath: '/test/ios/TestApp/Info.plist',
      pbxprojPath: null,
      podfileLockPath: null,
      privacyManifestPath: '/test/ios/TestApp/PrivacyInfo.xcprivacy',
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
    packageJson: {},
  };
}

describe('runner', () => {
  it('returns results for all rules', async () => {
    const ctx = makeContext();
    const result = await runRules(ctx);
    expect(result.runs.length).toBeGreaterThan(0);
  });

  it('respects rule filter', async () => {
    const ctx = makeContext();
    const result = await runRules(ctx, {}, { ruleFilter: 'security/insecure-transport' });
    expect(result.runs).toHaveLength(1);
    expect(result.runs[0].rule.meta.id).toBe('security/insecure-transport');
  });

  it('respects category filter', async () => {
    const ctx = makeContext();
    const result = await runRules(ctx, {}, { ruleFilter: 'privacy/*' });
    expect(result.runs.every((r) => r.rule.meta.category === 'privacy')).toBe(true);
  });

  it('respects severity filter', async () => {
    const ctx = makeContext();
    const result = await runRules(ctx, {}, { minSeverity: 'error' });
    expect(result.runs.every((r) => r.rule.meta.severity === 'error')).toBe(true);
  });

  it('respects config rule disabling', async () => {
    const ctx = makeContext();
    const result = await runRules(ctx, {
      rules: { 'security/insecure-transport': { enabled: false } },
    });
    expect(result.runs.find((r) => r.rule.meta.id === 'security/insecure-transport')).toBeUndefined();
  });
});
