import assert from 'assert';
import cpx from 'cpx';

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

    this.cmd.logger.info(this.name, 'coping files to: ' + dest);
    await this.copy(source, dest, this.config);

    return;
  }

  async initialize(): Promise<void> {
    this.inited_ = true;
  }

  async validate(): Promise<boolean> {
    assert.equal('string', typeof this.config.source);
    assert.equal('string', typeof this.config.dest);
    return true;
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
