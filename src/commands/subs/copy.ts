import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import Path from 'path';
import assert from 'assert';
import cpx from 'cpx';
import map from 'lodash/map';

import { SubCommand } from '../../core/SubCommand';
import ValidationError from '../../core/ValidationError';
import { findIndex } from 'lodash';

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

export type CopySource = string | string[] | (string | CopySourceGlob)[];

export interface CopyConfig {
  /**
   * blob path for source files.
   */
  source: CopySource;
  /**
   * The dest path.
   */
  dest: string;

  // other configs for cpx.
  [key: string]: any;
}

/**
 * Copy files.
 */
export default class CopySubCmd extends SubCommand {
  get config(): CopyConfig {
    const options = this.cmd.options;

    return {
      source: options.source,
      dest: options.dest,
      ...options
    };
  }

  async execute(): Promise<any> {
    if (!this.inited) {
      throw new ValidationError(this.name, 'Command is not initialized');
    }
    await this.validate();

    const { source, dest } = this.config;
    const copyConfig = {
      ...this.config,
      includeEmptyDirs: true
    };

    let sourcePaths = [];

    if (!isArray(source)) {
      sourcePaths = [source];
    } else {
      sourcePaths = source;
    }

    await Promise.all(
      map(sourcePaths, async s => {
        const { glob: sourceDir, base } = this.resolveSourcePath(s);

        const destDir = this.cmd.resolvePath(Path.join(dest, base));

        this.cmd.logger.info(
          this.name,
          'copying files: ',
          sourceDir,
          '=>',
          destDir
        );
        await this.copy(sourceDir, destDir, copyConfig);
      })
    );

    return;
  }

  resolveSourcePath(s: CopySourceGlob | string): CopySourceGlob {
    if (isPlainObject(s) && (s as CopySourceGlob).glob) {
      return s as CopySourceGlob;
    }

    // extract the base from the glob.
    const source = s as string;
    const paths = source.split(Path.delimiter);
    const index = findIndex(paths, p => {
      return p != '.' && p !== '..';
    });

    const base = paths.slice(0, index + 1).join(Path.delimiter);

    return {
      glob: s as string,
      base: base
    };
  }

  async initialize(): Promise<void> {
    this.inited_ = true;
  }

  async validate(): Promise<any> {
    const source = this.config.source;

    assert.equal('string', typeof this.config.dest);
    if (!isString(source) && !isArray(source)) {
      throw new Error(
        'source must be of type string|array, received ' + typeof source
      );
    }
  }

  async copy(
    source: string,
    dest: string,
    options: { [key: string]: any }
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      cpx.copy(source, dest, options, (err: Error | null) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}
