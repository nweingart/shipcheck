import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { parsePlist } from '../../src/parsers/plist.js';

const FIXTURE_DIR = join(import.meta.dirname, '..', 'fixtures', 'sample-rn-project');

describe('plist parser', () => {
  it('parses the fixture Info.plist', async () => {
    const result = await parsePlist(join(FIXTURE_DIR, 'ios/SampleApp/Info.plist'));
    expect(result).not.toBeNull();
    expect(result!.purposeStrings).toHaveProperty('NSCameraUsageDescription');
    expect(result!.purposeStrings).toHaveProperty('NSMicrophoneUsageDescription');
    expect(result!.ats.allowsArbitraryLoads).toBe(true);
    expect(result!.urlSchemes).toContain('sampleapp');
    expect(result!.bundleShortVersion).toBe('1.0.0');
  });

  it('returns null for non-existent file', async () => {
    const result = await parsePlist('/nonexistent/Info.plist');
    expect(result).toBeNull();
  });
});
