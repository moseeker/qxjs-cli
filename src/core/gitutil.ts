import execa from 'execa';

export async function getLatestCommit(cwd?: string): Promise<string> {
  if (!cwd) {
    cwd = process.cwd();
  }

  const oldCwd = process.cwd();

  process.chdir(cwd);

  const result = await execa('git', ['rev-parse', 'HEAD']);

  process.chdir(oldCwd);

  return result.stdout;
}

export async function isRepoClean(cwd: string): Promise<boolean> {
  const oldCwd = process.cwd();

  process.chdir(cwd);

  let isClean = true;

  try {
    const result = await execa.sync('git', ['status']);
    const out = result.stdout;
    if (out.indexOf('working tree clean') === -1) {
      isClean = false;
    }
  } catch (err) {
    isClean = false;
  }

  process.chdir(oldCwd);

  return isClean;
}
