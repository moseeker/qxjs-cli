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

  return {
    glob: s as string,
    base: ''
  };
}
