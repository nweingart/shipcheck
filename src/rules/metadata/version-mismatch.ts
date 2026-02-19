import type { Rule } from '../../types/index.js';

export const versionMismatch: Rule = {
  meta: {
    id: 'metadata/version-mismatch',
    title: 'Version Mismatch',
    description:
      'MARKETING_VERSION in project.pbxproj does not match the version in package.json.',
    severity: 'warning',
    category: 'metadata',
    fixable: true,
  },

  check(context) {
    const violations = [];

    const pbxVersion = context.pbxproj?.marketingVersion;
    const pkgVersion = context.packageJson?.version as string | undefined;

    if (pbxVersion && pkgVersion && pbxVersion !== pkgVersion) {
      violations.push({
        message: `MARKETING_VERSION in pbxproj is "${pbxVersion}" but package.json version is "${pkgVersion}"`,
        file: context.project.pbxprojPath ?? undefined,
        fix: {
          prompt: `Update the MARKETING_VERSION in the Xcode project (project.pbxproj) to match the version in package.json ("${pkgVersion}"). Make sure to update all occurrences of MARKETING_VERSION in the pbxproj file.`,
          files: [context.project.pbxprojPath!],
        },
      });
    }

    return { violations };
  },
};
