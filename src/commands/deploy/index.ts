import runAll from 'npm-run-all';
import standardVersion from 'standard-version';
import Command from '../../core/Command';
import CopySubCmd, { CopyConfig } from '../subs/copy';
import ReleaseSubCmd from '../subs/release';
import ValidationError from '../../core/ValidationError';
import execa from 'execa';

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

  validateConfig() {
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
  }

  async execute(): Promise<void> {
    this.logger.info(this.name, 'cwd:', this.options.rootPath);

    this.enableProgressBar();
    this.validateConfig();

    // check
    await this.checkWorkdirClean();
    // run build command.
    await this.runBuild();

    // clean up dest.
    this.release.cleanup(this.config.dest);
    // copy files.
    await this.copy.execute();
    // release.
    await this.release.execute();

    this.logger.success(this.name, '🥳 success');
  }

  async runBuild(): Promise<void> {
    const buildScriptName = this.config.build;

    return runAll([buildScriptName], {});
  }

  async checkWorkdirClean() {
    try {
      const result = await execa.sync('git', ['status']);
      const out = result.stdout;
      if (out.indexOf('working tree clean') === -1) {
        throw new ValidationError(this.name, 'please push this project first');
      }
    } catch (err) {
      throw new ValidationError(this.name, err.message, err);
    }
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
