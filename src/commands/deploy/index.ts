import assert from 'assert';
import Command from '../../core/Command';

/**
 * Deploy qxjs project.
 */
export class DeployCommand extends Command {
  configSectionName = 'deploy';

  initialize() {
    this.logger.success('abc');
  }

  validateConfig() {
    const config = this.project?.get(['config', this.configSectionName]);
    assert.equal(!!config, true);
  }

  async execute(): Promise<void> {
    this.validateConfig();
  }
}

export default function factory(argv: any) {
  return new DeployCommand(argv);
}
