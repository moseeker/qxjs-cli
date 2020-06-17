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
import { getLatestCommit, isRepoClean } from '../../core/gitutil';

export interface ReleaseSubCmdConfig {
  cwd?: string;
}

interface ExecuateContext {
  /**
   * The source project latest commit.
   */
  sourceCommit?: string;
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
    this.cmd.logger.info(this.name, 'cleanup', cwdDir);
    const oldCwd = this.enter(cwdDir);
    // clean up the working dir.
    await execa('git', ['clean', '-dfx']);
    await execa('git', ['reset', '--hard']);
    await execa('git', ['checkout', 'master']);
    await execa('git', ['pull', 'origin', 'master']);

    this.cmd.logger.success(this.name, 'cleanup done');

    // clean up.
    this.leave(oldCwd);
    this.cmd.logger.info(this.name, 'cwd', process.cwd());
  }

  async execute(ctx: ExecuateContext): Promise<string> {
    ctx = ctx || {};

    this.cmd.logger.info(this.name, 'begin release');

    if (!this.inited) {
      throw new ValidationError(this.name, 'not initialized');
    }

    await this.validate();

    // commit stuff.
    const oldCwd = this.enter(this.config.cwd);
    this.cmd.logger.info(this.name, 'git commit', process.cwd());
    const cwd = process.cwd();
    const isClean = await isRepoClean(cwd);

    let execResult;

    if (!isClean) {
      execResult = await execa('git', ['add', '.']);
      this.logExecResult(execResult);

      execResult = await execa(
        'git',
        ['commit', '-m', this.getCommitInfo_(ctx.sourceCommit)],
        {
          stdout: process.stdout,
          stderr: process.stderr,
          buffer: false
        }
      );
      this.logExecResult(execResult);

      await this.standardVersion();
    } else {
      this.cmd.logger.warn(
        this.name,
        'repo is already clean, going to push it'
      );
    }

    execResult = await execa(
      'git',
      ['push', '--follow-tags', 'origin', 'master'],
      {
        buffer: true
      }
    );

    this.logExecResult(execResult);

    const commit = await getLatestCommit(process.cwd());

    this.leave(oldCwd);

    this.cmd.logger.success(this.name, '🏁 release done');

    return commit;
  }

  logExecResult(r: { stderr?: string; stdout?: string }) {
    if (r.stdout) {
      this.cmd.logger.success(this.name, r.stdout);
    } else if (r.stderr) {
      this.cmd.logger.info(this.name, r.stderr);
    }
  }

  async standardVersion(): Promise<void> {
    return standardVersion({
      noVerify: true,
      infile: 'CHANGELOG.md',
      silent: true
    });
  }

  getCommitInfo_(msg: string) {
    return `feat: ${msg || new Date().toString()}`;
  }
}
