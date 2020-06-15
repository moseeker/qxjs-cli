import assert from 'assert';
import Command from '../../core/Command';
import CopySubCmd from '../subs/copy';

/**
 * Deploy qxjs project.
 */
export class DeployCommand extends Command {
  configSectionName = 'deploy';
  copy: CopySubCmd;

  initialize() {
    this.logger.success('abc');

    this.copy = new CopySubCmd(this);
  }

  validateConfig() {
    const config = this.project?.get(['config', this.configSectionName]);
    assert.equal(!!config, true);
  }

  async execute(): Promise<void> {
    this.validateConfig();

    // copy files.
    await this.copy.execute();
  }
}

export default function factory(argv: any) {
  return new DeployCommand(argv);
}
