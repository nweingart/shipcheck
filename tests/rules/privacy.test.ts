import { describe, it, expect } from 'vitest';
import { missingPurposeStrings } from '../../src/rules/privacy/missing-purpose-strings.js';
import { missingPrivacyManifest } from '../../src/rules/privacy/missing-privacy-manifest.js';
import { overbroadPermissions } from '../../src/rules/privacy/overbroad-permissions.js';
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

describe('privacy/missing-purpose-strings', () => {
  it('flags missing camera purpose string when code uses camera API', async () => {
    const ctx = makeContext({
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'import { launchCamera } from "react-native-image-picker";' }],
    });
    const result = await missingPurposeStrings.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('NSCameraUsageDescription');
  });

  it('does not flag when purpose string is present', async () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: { NSCameraUsageDescription: 'We need camera access' },
        ats: {},
        urlSchemes: [],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'import { launchCamera } from "react-native-image-picker";' }],
    });
    const result = await missingPurposeStrings.check(ctx);
    expect(result.violations).toHaveLength(0);
  });

  it('does not flag when code has no permission APIs', async () => {
    const ctx = makeContext({
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'console.log("hello");' }],
    });
    const result = await missingPurposeStrings.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});

describe('privacy/missing-privacy-manifest', () => {
  it('flags when no privacy manifest exists', () => {
    const ctx = makeContext();
    const result = missingPrivacyManifest.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('PrivacyInfo.xcprivacy');
  });

  it('does not flag when privacy manifest exists', () => {
    const ctx = makeContext({
      project: {
        rootDir: '/test',
        iosDir: '/test/ios',
        appName: 'TestApp',
        infoPlistPath: '/test/ios/TestApp/Info.plist',
        pbxprojPath: null,
        podfileLockPath: null,
        privacyManifestPath: '/test/ios/TestApp/PrivacyInfo.xcprivacy',
      },
    });
    const result = missingPrivacyManifest.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});

describe('privacy/overbroad-permissions', () => {
  it('flags permissions declared in plist but not used in code', () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: { NSMicrophoneUsageDescription: 'We need your microphone' },
        ats: {},
        urlSchemes: [],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'console.log("no mic usage");' }],
    });
    const result = overbroadPermissions.check(ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('NSMicrophoneUsageDescription');
  });

  it('does not flag when permission matches code usage', () => {
    const ctx = makeContext({
      plist: {
        raw: {},
        purposeStrings: { NSCameraUsageDescription: 'For photos' },
        ats: {},
        urlSchemes: [],
        bundleVersion: '1',
        bundleShortVersion: '1.0.0',
      },
      sourceFiles: [{ path: '/test/src/App.tsx', content: 'launchCamera({ mediaType: "photo" })' }],
    });
    const result = overbroadPermissions.check(ctx);
    expect(result.violations).toHaveLength(0);
  });
});
