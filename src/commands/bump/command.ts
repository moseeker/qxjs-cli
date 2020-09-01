import yargs from 'yargs';
import runner from '.';

export const command = 'bump <pkg> <version-range>';

export const describe = 'Bump a package version';

export const builder = (yargs: yargs.Argv) => {
  yargs
    .positional('pkg', {
      describe: 'The package name',
      type: 'string'
    })
    .positional('version-range', {
      describe: 'The package version range',
      type: 'string'
    })
    .fail(() => {
      console.log('Please run qx bump -h for usage');
      return;
    });

  return yargs;
};

export const handler = async (argv: any[]) => {
  await runner(argv).runner;
};
