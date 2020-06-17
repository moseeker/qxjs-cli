import runAll from 'npm-run-all';
import fs from 'fs';
import standardVersion from 'standard-version';
import Command from '../../core/Command';
import CopySubCmd, { CopyConfig } from '../subs/copy';
import ReleaseSubCmd from '../subs/release';
import ValidationError from '../../core/ValidationError';
import { getLatestCommit, isRepoClean } from '../../core/gitutil';

export interface DeployCommandConfig extends CopyConfig {
  /**
   * The npm build script name
   * support npm-run-all options, see: https://github.com/mysticatea/npm-run-all/blob/HEAD/docs/node-api.md
   */
  build: string;
}

/**
 * Deploy qxjs project.
 */
export class DeployCommand extends Command {
  configSectionName = 'deploy';
  copy: CopySubCmd;
  release: ReleaseSubCmd;

  get config() {
    return this.project?.get([
      'config',
      this.configSectionName
    ]) as DeployCommandConfig;
  }

  initialize() {
    this.copy = new CopySubCmd(this);
    this.release = new ReleaseSubCmd(this);

    this.copy.initialize();
    this.release.initialize({ cwd: this.config.dest });
  }

  async validateConfig() {
    if (this.project.empty) {
      throw new ValidationError(
        this.name,
        "This project doesn't contain any configuration."
      );
    }

    const config = this.config;
    if (!config) {
      throw new ValidationError(this.name, 'deploy configuration is not set');
    }
    if (!config.build) {
      throw new ValidationError(
        this.name,
        `{config}.build must be of type string, received ${typeof config.build}`
      );
    }

    const dest = this.resolvePath(this.config.dest);
    try {
      const stats = fs.statSync(dest);
      if (!stats.isDirectory()) {
        throw new ValidationError(this.name, `${dest} is not a directory`);
      }
    } catch (err) {
      throw new ValidationError(this.name, `ENOENT: ${dest} doesn't exist`);
    }
  }

  async execute(): Promise<void> {
    const oldCwd = this.release.enter(this.options.rootPath);

    this.enableProgressBar();
    await this.validateConfig();

    const currentWorkingDir = process.cwd();

    // check
    const repoIsClean = await isRepoClean(currentWorkingDir);
    if (!repoIsClean) {
      throw new ValidationError(
        this.name,
        `⛈  please make sure repo [${currentWorkingDir}] is up-to-date & clean.`
      );
    } else {
      this.logger.info(this.name, `working dir [${process.cwd()}] is clean`);
    }
    // run build command.
    await this.runBuild();

    const latestCommit = await getLatestCommit(currentWorkingDir);

    // clean up dest.
    await this.release.cleanup(this.config.dest);
    // copy files.
    await this.copy.execute();
    // release.
    const releasedCommit = await this.release.execute({
      sourceCommit: latestCommit
    });

    this.release.leave(oldCwd);

    this.logger.success(
      this.name,
      '🥳 success, the commit version: \n',
      releasedCommit
    );
  }

  async runBuild(): Promise<void> {
    this.logger.info(this.name, 'running build script');

    const buildScriptName = this.config.build;

    this.logger.pause();

    await runAll([buildScriptName], {
      stdout: process.stdout,
      stderr: process.stderr,
      stdin: process.stdin,
      printName: true,
      printLabel: true
    });

    this.logger.resume();
  }

  /**
   * not used.
   */
  async standardVersion(): Promise<void> {
    return standardVersion({
      noVerify: true,
      infile: 'CHANGELOG.md',
      silent: true
    });
  }
}

export default function factory(argv: any) {
  return new DeployCommand(argv);
}
