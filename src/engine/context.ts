import { join } from 'node:path';
import type { RuleContext, ShipcheckConfig } from '../types/index.js';
import { detectProject } from './project-detector.js';
import { parsePlist } from '../parsers/plist.js';
import { parsePbxproj } from '../parsers/pbxproj.js';
import { scanSourceFiles } from '../parsers/source-scanner.js';
import { readJson } from '../utils/fs.js';

export async function buildContext(
  rootDir: string,
  config: ShipcheckConfig = {},
): Promise<RuleContext> {
  const project = await detectProject(rootDir, config.iosDir);

  const [plist, pbxproj, sourceFiles, packageJson] = await Promise.all([
    project.infoPlistPath ? parsePlist(project.infoPlistPath) : null,
    project.pbxprojPath ? parsePbxproj(project.pbxprojPath) : null,
    scanSourceFiles(rootDir, { include: config.include, exclude: config.exclude }),
    readJson<Record<string, unknown>>(join(rootDir, 'package.json')),
  ]);

  return {
    project,
    plist,
    pbxproj,
    sourceFiles,
    packageJson,
  };
}
