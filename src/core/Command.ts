import log, { Logger } from 'npmlog';
import Path from 'path';
import Project from './Project';
import { CommandArgv, CommandOption } from './utils';

const cliPrefix = 'qxjs';

type OnResolved = (value: any) => any;
type OnRejected = (err: Error) => PromiseLike<Error>;

export default abstract class Command {
  options: CommandOption = {};
  name: string;
  runner: Promise<any>;
  project?: Project;
  envDefaults: { [key: string]: any } = {};
  readonly argv: CommandArgv;

  constructor(cmdArgv: CommandArgv) {
    const argv = (this.argv = Object.assign({}, cmdArgv));
    this.name = this.constructor.name.replace(/Command$/, '').toLowerCase();

    log.pause();
    log.heading = cliPrefix;

    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        const cwd = this.argv.projectPath
          ? Path.resolve(process.cwd(), this.argv.projectPath)
          : process.cwd();
        this.project = new Project(cwd);
      });
      chain = chain.then(() => this.confiigureEnvironment());
      chain = chain.then(() => this.configureOptions());
      chain = chain.then(() => this.configureLogging());
      chain = chain.then(() => {
        this.logger.info(this.name, 'version', this.options.qxjsCliVersion);
        this.logger.verbose(this.name, 'options', this.options);
      });
      chain = chain.then(() => {
        // check project is empty
        if (this.project.empty) {
          throw new Error(
            'config file not found in current project, pass --verbose to see the full details'
          );
        }
      });
      chain = chain.then(() => this.runCommand());

      chain.then(
        result => {
          resolve(result);
        },
        (err: Error & { name: string }) => {
          reject(err);
        }
      );
    });

    if (argv.onResolved || argv.onRejected) {
      this.runner = this.runner.then(argv.onResolved, argv.onRejected);

      delete argv.onResolved; // eslint-disable-line no-param-reassign
      delete argv.onRejected; // eslint-disable-line no-param-reassign
    }
  }

  get logger(): Logger {
    return log['newGroup'](this.name) as Logger;
  }

  async then(onResolved: OnResolved, onRejected: OnRejected) {
    return this.runner.then(onResolved, onRejected);
  }

  async catch(onRejected: OnRejected) {
    return this.runner.catch(onRejected);
  }

  configureLogging() {
    const { loglevel } = this.options;
    if (loglevel) {
      log.level = loglevel;
    }

    log.addLevel('success', 3001, { fg: 'green', bold: true });
    log.resume();
  }

  configureOptions() {
    const commandConfig = this.project.get(['config', this.name]);
    const overrides = commandConfig;

    const { verbose } = this.argv;
    const loglevel = verbose ? 'verbose' : null;

    this.options = Object.assign(
      this.argv,
      this.project.config,
      overrides,
      this.envDefaults
    );

    if (loglevel && !this.options.loglevel) {
      this.options.loglevel = loglevel;
    }
  }

  async confiigureEnvironment() {
    const { default: ci } = await import('is-ci');
    let loglevel;
    let progress = true;

    if (ci || !process.stderr.isTTY) {
      log.disableColor();
      progress = false;
    } else if (!process.stdout.isTTY) {
      progress = false;
      loglevel = 'error';
    } else if (process.stderr.isTTY) {
      log.enableColor();
      log.enableUnicode();
    }

    this.envDefaults = {
      loglevel,
      progress
    };
  }

  enableProgressBar() {
    if (this.options.progress !== false) {
      log.enableProgress();
    }
  }

  async runCommand(): Promise<any> {
    const success = await this.initialize();
    if (success !== false) {
      return await this.execute();
    }

    return;
  }

  abstract async initialize(): Promise<boolean | void>;
  abstract async execute(): Promise<any>;

  /**
   * Resolve the path related to the cwd.
   */
  resolvePath(path: string): string {
    if (typeof path !== 'string') {
      throw new Error(
        'The `path` argument must be of type string. Received ' + typeof path
      );
    }
    const rootPath = this.project.rootPath;
    return Path.resolve(rootPath, path);
  }
}
