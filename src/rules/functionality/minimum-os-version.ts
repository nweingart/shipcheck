import type { Rule } from '../../types/index.js';

const MIN_RECOMMENDED_VERSION = 15;

export const minimumOsVersion: Rule = {
  meta: {
    id: 'functionality/minimum-os-version',
    title: 'Minimum OS Version',
    description:
      'iOS deployment target is below the recommended minimum. Very old deployment targets may cause App Review issues.',
    severity: 'warning',
    category: 'functionality',
    fixable: true,
  },

  check(context) {
    const violations = [];

    const target = context.pbxproj?.deploymentTarget;
    if (!target) return { violations: [] };

    const majorVersion = parseFloat(target);
    if (isNaN(majorVersion)) return { violations: [] };

    if (majorVersion < MIN_RECOMMENDED_VERSION) {
      violations.push({
        message: `iOS deployment target is ${target} (below recommended minimum of ${MIN_RECOMMENDED_VERSION}.0). Consider raising it to support modern APIs and reduce compatibility issues.`,
        file: context.project.pbxprojPath ?? undefined,
        fix: {
          prompt: `Update the IPHONEOS_DEPLOYMENT_TARGET in the Xcode project to "${MIN_RECOMMENDED_VERSION}.0". Update all occurrences in the project.pbxproj file. Also check the Podfile for any platform :ios version and update it to match.`,
          files: [
            context.project.pbxprojPath!,
            ...(context.project.podfileLockPath
              ? [context.project.podfileLockPath.replace('Podfile.lock', 'Podfile')]
              : []),
          ],
        },
      });
    }

    return { violations };
  },
};
