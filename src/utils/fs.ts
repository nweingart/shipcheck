import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

export async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T = Record<string, unknown>>(path: string): Promise<T | null> {
  const text = await readText(path);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
