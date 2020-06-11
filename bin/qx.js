const cli = require('../').cli;

const pkg = require('../package.json');

function main(argv) {
  const context = {
    qxjsCliVersion: pkg.version
  };

  return (
    cli()
      // .command(deployCmd)
      .parse(argv, context)
  );
}

main(process.argv);
