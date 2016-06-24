// Parses a 1.06 .lif file to stdout
// Works on Node 6.10

/*
  Usage:
  $ node parse.js somefile.lif | output
 */

const fs = require('fs');
const os = require('os');
const util = require('util');

const args = process.argv.splice(2);
const input = fs.readFileSync(args[0], { encoding: 'utf-8' })
              .split(os.EOL)
              .filter((line) => line.indexOf('#') === -1)
              .filter((line) => line !== '')
              .map((line) => line.split(' ').map((offset) => parseInt(offset, 10)));

console.log(JSON.stringify(input));
