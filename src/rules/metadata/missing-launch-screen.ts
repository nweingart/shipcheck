import fg from 'fast-glob';
import type { Rule } from '../../types/index.js';

export const missingLaunchScreen: Rule = {
  meta: {
    id: 'metadata/missing-launch-screen',
    title: 'Missing Launch Screen',
    description:
      'No LaunchScreen.storyboard found in the ios/ directory. Apple requires a launch screen for all apps.',
    severity: 'error',
    category: 'metadata',
    fixable: false,
  },

  async check(context) {
    const violations = [];

    const launchScreens = await fg('**/LaunchScreen.storyboard', {
      cwd: context.project.iosDir,
      onlyFiles: true,
      absolute: true,
    });

    if (launchScreens.length === 0) {
      violations.push({
        message:
          'No LaunchScreen.storyboard found in the ios/ directory. Apple requires all apps to include a launch storyboard. Apps without one will be rejected.',
        file: context.project.iosDir,
      });
    }

    return { violations };
  },
};
