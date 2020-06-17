import log from 'npmlog';
import dedent from 'dedent';
import yargs from 'yargs/yargs';
import ValidationError from './ValidationError';

export default function cli(argv: any[], cwd: string) {
  const cli = yargs(argv, cwd);
  return cli
    .usage('Usage: $0 <command> [options]')
    .demandCommand(
      1,
      'A command is required. Pass --help to see all available commands and options.'
    )
    .option('V', {
      type: 'boolean',
      describe: 'Verbose mode, show more logs',
      alias: 'verbose'
    })
    .recommendCommands()
    .strict()
    .fail((msg: string, err: Error & { code?: number }) => {
      const actual = err || (new Error(msg) as Error & { code?: number });
      actual.code = actual.code || 1;

      if (actual.name !== 'ValidationError') {
        log.error('qxjs', actual.message);
      }

      if (actual.code < 1) {
        actual.code = 1;
      }
      cli.exit(actual.code, actual);
    })
    .alias('h', 'help')
    .alias('v', 'version')
    .wrap(cli.terminalWidth())
    .epilogue(
      dedent`
      For more information, visit https://github.com/moseeker/qxjs-cli.
    `
    )
    .help();
}
