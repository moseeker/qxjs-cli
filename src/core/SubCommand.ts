import Command from './Command';

export interface ISubCommand {
  readonly isSubCmd: boolean;

  execute(): Promise<any>;
}

export abstract class SubCommand implements ISubCommand {
  readonly name: string;
  readonly isSubCmd = true;
  cmd: Command;
  inited_ = false;

  constructor(cmd: Command) {
    this.cmd = cmd;

    this.name = this.constructor.name
      .replace(/(command|cmd|subcmd|subcommand)$/i, '')
      .toLowerCase();
  }

  get inited() {
    return this.inited_;
  }

  abstract initialize(): Promise<any>;
  abstract execute(): Promise<any>;
}
