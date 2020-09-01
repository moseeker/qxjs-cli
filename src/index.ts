import cli from './core/cli';

// commands
import * as deployCmd from './commands/deploy/command';
import * as bumpCmd from './commands/bump/command';

export { cli, deployCmd, bumpCmd };
