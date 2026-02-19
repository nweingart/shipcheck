import { execFile } from 'node:child_process';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function exec(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number } = {},
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = execFile(
      command,
      args,
      {
        cwd: options.cwd,
        timeout: options.timeout ?? 120_000,
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout?.toString() ?? '',
          stderr: stderr?.toString() ?? '',
          exitCode: error ? (error as NodeJS.ErrnoException & { code?: number }).code === undefined
            ? 1
            : (child.exitCode ?? 1)
            : 0,
        });
      },
    );
  });
}

export async function which(command: string): Promise<string | null> {
  const result = await exec('which', [command]);
  if (result.exitCode === 0 && result.stdout.trim()) {
    return result.stdout.trim();
  }
  return null;
}
