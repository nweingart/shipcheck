import { join } from 'node:path';
import fg from 'fast-glob';
import type { ProjectInfo } from '../types/index.js';
import { fileExists, readJson } from '../utils/fs.js';

/**
 * Detect a React Native iOS project structure from a root directory.
 */
export async function detectProject(rootDir: string, iosDirOverride?: string): Promise<ProjectInfo> {
  const iosDir = iosDirOverride ?? join(rootDir, 'ios');

  if (!(await fileExists(iosDir))) {
    throw new Error(`No ios/ directory found at ${iosDir}. Is this a React Native project?`);
  }

  // Detect app name from .xcodeproj directory
  const xcodeprojDirs = await fg('*.xcodeproj', { cwd: iosDir, onlyDirectories: true });
  let appName = 'App';
  if (xcodeprojDirs.length > 0) {
    appName = xcodeprojDirs[0].replace('.xcodeproj', '');
  } else {
    // fallback to package.json name
    const pkg = await readJson<{ name?: string }>(join(rootDir, 'package.json'));
    if (pkg?.name) appName = pkg.name;
  }

  // Find Info.plist
  const plistCandidates = [
    join(iosDir, appName, 'Info.plist'),
    join(iosDir, 'Info.plist'),
  ];
  let infoPlistPath: string | null = null;
  for (const candidate of plistCandidates) {
    if (await fileExists(candidate)) {
      infoPlistPath = candidate;
      break;
    }
  }
  // Fallback: glob for Info.plist
  if (!infoPlistPath) {
    const found = await fg('**/Info.plist', { cwd: iosDir, absolute: true, onlyFiles: true });
    if (found.length > 0) infoPlistPath = found[0];
  }

  // Find project.pbxproj
  const pbxprojCandidates = await fg('**/*.pbxproj', { cwd: iosDir, absolute: true, onlyFiles: true });
  const pbxprojPath = pbxprojCandidates.length > 0 ? pbxprojCandidates[0] : null;

  // Find Podfile.lock
  const podfileLockPath = (await fileExists(join(iosDir, 'Podfile.lock')))
    ? join(iosDir, 'Podfile.lock')
    : null;

  // Find PrivacyInfo.xcprivacy
  const privacyFiles = await fg('**/PrivacyInfo.xcprivacy', { cwd: iosDir, absolute: true, onlyFiles: true });
  const privacyManifestPath = privacyFiles.length > 0 ? privacyFiles[0] : null;

  return {
    rootDir,
    iosDir,
    appName,
    infoPlistPath,
    pbxprojPath,
    podfileLockPath,
    privacyManifestPath,
  };
}
