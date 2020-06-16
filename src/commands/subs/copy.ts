import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import assert from 'assert';
import cpx from 'cpx';
import each from 'lodash/each';

import { SubCommand } from '../../core/SubCommand';
import ValidationError from '../../core/ValidationError';

export interface CopyConfig {
  /**
   * blob path for source files.
   */
  source: string;
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

    const destDir = this.cmd.resolvePath(dest);

    each(sourcePaths, async s => {
      const sourceDir = this.cmd.resolvePath(s);
      this.cmd.logger.info(this.name, 'copying files: ', s, '=>', dest);
      await this.copy(sourceDir, destDir, copyConfig);
    });

    return;
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
