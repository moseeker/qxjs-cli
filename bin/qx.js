#!/usr/bin/env node

const log = require('npmlog');
const lib = require('../');
const pkg = require('../package.json');

const cli = lib.cli;
const deployCmd = lib.deployCmd;

function main(argv) {
  const context = {
    qxjsCliVersion: pkg.version
  };

  log.silly('qxjs', 'cwd', process.cwd());

  return cli()
    .command(deployCmd)
    .parse(argv, context);
}

main(process.argv.slice(2));
