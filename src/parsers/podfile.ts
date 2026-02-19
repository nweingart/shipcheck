import { readText } from '../utils/fs.js';

export interface PodfileLockInfo {
  pods: string[];
  raw: string;
}

export async function parsePodfileLock(path: string): Promise<PodfileLockInfo | null> {
  const raw = await readText(path);
  if (!raw) return null;

  const pods: string[] = [];
  const podSection = raw.match(/PODS:\n([\s\S]*?)(?:\n\n|\nDEPENDENCIES:)/);
  if (podSection) {
    const lines = podSection[1].split('\n');
    for (const line of lines) {
      // Top-level pods start with "  - PodName (version)"
      const match = line.match(/^\s{2}-\s+([^\s(]+)/);
      if (match) {
        pods.push(match[1]);
      }
    }
  }

  return { pods, raw };
}
