import { describe, it, expect } from 'vitest';
import { versionMismatch } from '../../src/rules/metadata/version-mismatch.js';
import type { RuleContext } from '../../src/types/index.js';

function makeContext(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    project: {
      rootDir: '/test',
      iosDir: '/test/ios',
      appName: 'TestApp',
      infoPlistPath: null,
      pbxprojPath: '/test/ios/TestApp.xcodeproj/project.pbxproj',
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

describe('metadata/version-mismatch', () => {
  it('flags when pbxproj and package.json versions differ', () => {
    const ctx = makeContext({
      pbxproj: { raw: '', marketingVersion: '2.0.0', deploymentTarget: '15.0', appIconName: 'AppIcon' },
      packageJson: { version: '1.0.0' },
    });
    const result = versionMismatch.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('2.0.0');
    expect(result.violations[0].message).toContain('1.0.0');
  });

  it('does not flag when versions match', () => {
    const ctx = makeContext({
      pbxproj: { raw: '', marketingVersion: '1.0.0', deploymentTarget: '15.0', appIconName: 'AppIcon' },
      packageJson: { version: '1.0.0' },
    });
    const result = versionMismatch.check(ctx);
    expect(result.violations).toHaveLength(0);
  });

  it('does not flag when pbxproj is missing', () => {
    const ctx = makeContext({
      packageJson: { version: '1.0.0' },
    });
    const result = versionMismatch.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});
