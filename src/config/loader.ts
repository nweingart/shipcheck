import { join } from 'node:path';
import type { ShipcheckConfig } from '../types/index.js';
import { readJson, readText, fileExists } from '../utils/fs.js';
import { configSchema } from './schema.js';
import { defaultConfig } from './defaults.js';
import { logger } from '../utils/logger.js';

const CONFIG_FILES = [
  '.shipcheckrc.json',
  'shipcheck.config.json',
];

export async function loadConfig(
  rootDir: string,
  configPath?: string,
): Promise<ShipcheckConfig> {
  let raw: Record<string, unknown> | null = null;

  if (configPath) {
    raw = await readJson(configPath);
    if (!raw) {
      throw new Error(`Config file not found: ${configPath}`);
    }
  } else {
    // Search for config files
    for (const name of CONFIG_FILES) {
      const path = join(rootDir, name);
      if (await fileExists(path)) {
        raw = await readJson(path);
        if (raw) {
          logger.debug(`Loaded config from ${path}`);
          break;
        }
      }
    }
  }

  if (!raw) {
    return { ...defaultConfig };
  }

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid config:\n${issues}`);
  }

  return { ...defaultConfig, ...result.data };
}
