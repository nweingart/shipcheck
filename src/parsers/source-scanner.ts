import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import type { SourceFile } from '../types/index.js';

const DEFAULT_PATTERNS = [
  '**/*.{ts,tsx,js,jsx}',
];

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/ios/Pods/**',
  '**/android/**',
  '**/dist/**',
  '**/build/**',
  '**/.expo/**',
  '**/coverage/**',
];

export async function scanSourceFiles(
  rootDir: string,
  options: { include?: string[]; exclude?: string[] } = {},
): Promise<SourceFile[]> {
  const patterns = options.include?.length ? options.include : DEFAULT_PATTERNS;
  const ignore = [...DEFAULT_IGNORE, ...(options.exclude ?? [])];

  const paths = await fg(patterns, {
    cwd: rootDir,
    ignore,
    absolute: true,
    onlyFiles: true,
  });

  const files: SourceFile[] = [];
  for (const path of paths) {
    try {
      const content = await readFile(path, 'utf-8');
      files.push({ path, content });
    } catch {
      // skip unreadable files
    }
  }

  return files;
}
