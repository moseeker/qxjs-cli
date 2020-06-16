import assert from 'assert';
import Command from '../../core/Command';
import CopySubCmd from '../subs/copy';
import ValidationError from '../../core/ValidationError';

/**
 * Deploy qxjs project.
 */
export class DeployCommand extends Command {
  configSectionName = 'deploy';
  copy: CopySubCmd;

  initialize() {
    this.copy = new CopySubCmd(this);
    this.copy.initialize();
  }

  validateConfig() {
    if (this.project.empty) {
      throw new ValidationError(
        this.name,
        "This project doesn't contain any configuration."
      );
    }

    const config = this.project?.get(['config', this.configSectionName]);
    if (!config) {
      throw new ValidationError(this.name, 'deploy configuration is not set');
    }
  }

  async execute(): Promise<void> {
    this.logger.info(this.name, 'cwd:', this.options.rootPath);

    this.enableProgressBar();
    this.validateConfig();
    // copy files.
    await this.copy.execute();
  }
}

export default function factory(argv: any) {
  return new DeployCommand(argv);
}
