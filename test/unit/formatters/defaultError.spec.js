const defaultError = require('../../../src/formatters/defaultError');
const expect = require('expect');
const chalk = require('chalk');

const noColor = (arr) => arr.map(chalk.stripColor);
const error = { message: 'Error message', file: './src/index.js' };

it('Formats errors with no type', () => {
  expect(noColor(defaultError([error], 'Warning'))).toEqual([
    ' Warning  in ./src/index.js',
    '',
    'Error message',
    '',
  ]);
});

it('Does not format other errors', () => {
  const otherError = { type: 'other-error' };
  expect(noColor(defaultError([otherError], 'Error'))).toEqual([]);
});
