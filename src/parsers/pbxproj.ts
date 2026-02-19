import type { ParsedPbxproj } from '../types/index.js';
import { readText } from '../utils/fs.js';

function extractField(raw: string, field: string): string | null {
  // Match field = value; in pbxproj format
  const regex = new RegExp(`${field}\\s*=\\s*([^;]+);`);
  const match = raw.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/"/g, '');
}

export async function parsePbxproj(path: string): Promise<ParsedPbxproj | null> {
  const raw = await readText(path);
  if (!raw) return null;

  return {
    raw,
    marketingVersion: extractField(raw, 'MARKETING_VERSION'),
    deploymentTarget: extractField(raw, 'IPHONEOS_DEPLOYMENT_TARGET'),
    appIconName: extractField(raw, 'ASSETCATALOG_COMPILER_APPICON_NAME'),
  };
}
