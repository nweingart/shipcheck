import { join } from 'node:path';
import fg from 'fast-glob';
import type { Rule } from '../../types/index.js';
import { fileExists } from '../../utils/fs.js';

const REQUIRED_ICON_SIZE = 1024; // 1024x1024 App Store icon

export const missingIcons: Rule = {
  meta: {
    id: 'metadata/missing-icons',
    title: 'Missing App Icons',
    description:
      'Missing required app icon assets. The 1024x1024 App Store icon is required.',
    severity: 'error',
    category: 'metadata',
    fixable: false,
  },

  async check(context) {
    const violations = [];

    // Look for AppIcon.appiconset
    const iconSets = await fg('**/AppIcon.appiconset', {
      cwd: context.project.iosDir,
      onlyDirectories: true,
      absolute: true,
    });

    if (iconSets.length === 0) {
      violations.push({
        message: 'No AppIcon.appiconset found in the ios/ directory. App icons are required for App Store submission.',
        file: context.project.iosDir,
      });
      return { violations };
    }

    const iconSetDir = iconSets[0];
    const contentsPath = join(iconSetDir, 'Contents.json');

    if (!(await fileExists(contentsPath))) {
      violations.push({
        message: 'AppIcon.appiconset exists but has no Contents.json',
        file: iconSetDir,
      });
      return { violations };
    }

    // Check for actual image files
    const imageFiles = await fg('*.{png,jpg,jpeg}', {
      cwd: iconSetDir,
      onlyFiles: true,
    });

    if (imageFiles.length === 0) {
      violations.push({
        message: 'AppIcon.appiconset has no image files. Add at least a 1024x1024 App Store icon.',
        file: iconSetDir,
      });
    }

    return { violations };
  },
};
