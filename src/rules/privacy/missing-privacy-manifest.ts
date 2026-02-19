import type { Rule } from '../../types/index.js';

export const missingPrivacyManifest: Rule = {
  meta: {
    id: 'privacy/missing-privacy-manifest',
    title: 'Missing Privacy Manifest',
    description:
      'No PrivacyInfo.xcprivacy file found. Required since Spring 2024 for apps that use required reason APIs.',
    severity: 'error',
    category: 'privacy',
    fixable: true,
  },

  check(context) {
    if (context.project.privacyManifestPath) {
      return { violations: [] };
    }

    return {
      violations: [
        {
          message:
            'No PrivacyInfo.xcprivacy file found in the ios/ directory. Apple requires a privacy manifest for apps using required reason APIs (UserDefaults, file timestamp, disk space, etc.).',
          file: context.project.iosDir,
          fix: {
            prompt: `Create a PrivacyInfo.xcprivacy file in the ios/${context.project.appName}/ directory. It should declare the privacy nutrition label data types the app collects and the required reason APIs it uses. At minimum, include NSPrivacyAccessedAPITypes for UserDefaults (category NSPrivacyAccessedAPICategoryUserDefaults with reason "CA92.1") since React Native uses UserDefaults. Also include NSPrivacyTracking set to false and an empty NSPrivacyCollectedDataTypes array as a starting point.`,
            files: [context.project.iosDir],
          },
        },
      ],
    };
  },
};
