import yargs from 'yargs';
import runner from '.';

export const command = 'deploy';

export const describe = 'Deploy a project';

export const builder = (yargs: yargs.Argv) => {
  yargs
    .positional('demo-positional', {
      describe: 'This is a demo arg, do nothing',
      type: 'string'
    })
    .options({
      'demo-folder-option': {
        group: 'Command Options:',
        defaultDescription: '<path>',
        describe: 'Demo option',
        choices: ['demo choice', 'demo choice 2']
      }
    });

  return yargs;
};

export const handler = (argv: any[]) => {
  return runner(argv);
};
