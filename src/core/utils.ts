import Path from 'path';
import isPlainObject from 'lodash/isPlainObject';

export interface CommandOption {
  [key: string]: any;
}

export interface CommandArgv {
  [key: string]: any;
}

export interface CopySourceGlob {
  /**
   * glob path.
   */
  glob: string;
  /**
   * base folder name to join with dest folder.
   */
  base?: string;
}

export function resolveSourcePath(s: CopySourceGlob | string): CopySourceGlob {
  if (isPlainObject(s) && (s as CopySourceGlob).glob) {
    return s as CopySourceGlob;
  }

  // extract the base from the glob.
  const source = s as string;
  const paths = source.split(Path.sep);
  let index = -1;

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    if (p !== '.' && p !== '..') {
      index = i;
      break;
    }
  }

  const base = index === -1 ? '' : paths.slice(0, index + 1).join(Path.sep);

  return {
    glob: s as string,
    base: base
  };
}
