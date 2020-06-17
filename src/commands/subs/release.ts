/**
 * Release sub command.
 * - commit current repo.
 * - standard-version.
 * - push it.
 * - return the latest commit hash.
 */

import execa from 'execa';
import standardVersion from 'standard-version';
import { SubCommand } from '../../core/SubCommand';
import ValidationError from '../../core/ValidationError';

export interface ReleaseSubCmdConfig {
  cwd?: string;
}

export default class ReleaseSubCmd extends SubCommand {
  config: ReleaseSubCmdConfig = {};

  async initialize(config: ReleaseSubCmdConfig) {
    this.config = config;
    this.inited_ = true;
  }

  async validate() {
    if (typeof this.config.cwd !== 'string') {
      throw new ValidationError(
        this.name,
        `{config}.cwd must be of string, received ${typeof this.config.cwd}`
      );
    }
  }

  enter(newCwd: string): string {
    const oldCwd = process.cwd();
    const cwd = this.cmd.resolvePath(newCwd);
    process.chdir(cwd);
    this.cmd.logger.info(this.name, 'enter', process.cwd());
    return oldCwd;
  }

  leave(oldCwd: string) {
    const cwd = this.cmd.resolvePath(oldCwd);
    this.cmd.logger.info(this.name, 'leave', process.cwd());
    process.chdir(cwd);
  }

  async cleanup(cwdDir: string) {
    const oldCwd = this.enter(cwdDir);
    // clean up the working dir.
    await execa('git', ['clean', '-dfx']);
    await execa('git', ['reset', '--hard']);
    await execa('git', ['checkout', 'origin/master']);
    await execa('git', ['pull']);

    // clean up.
    this.leave(oldCwd);
    this.cmd.logger.info(this.name, 'cwd', process.cwd());
    this.cmd.logger.success(this.name, 'done');
  }

  async execute() {
    if (!this.inited) {
      throw new ValidationError(this.name, 'not initialized');
    }

    await this.validate();

    // commit stuff.
    this.cmd.logger.info(this.name, 'git commit', process.cwd());
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', this.getCommitInfo_()]);
    await this.standardVersion();
    await execa('git', ['push', '--follow-tags', 'origin master']);
  }

  async standardVersion(): Promise<void> {
    return standardVersion({
      noVerify: true,
      infile: 'CHANGELOG.md',
      silent: true
    });
  }

  getCommitInfo_() {
    return `feat: ${new Date().toString()}`;
  }
}
