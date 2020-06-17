import yargs from 'yargs';
import runner from '.';

export const command = 'deploy [<project-path>]';

export const describe = 'Deploy a project';

export const builder = (yargs: yargs.Argv) => {
  yargs
    .positional('project-path', {
      describe: 'The project root that contains a config file',
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

export const handler = async (argv: any[]) => {
  await runner(argv).runner;
};
