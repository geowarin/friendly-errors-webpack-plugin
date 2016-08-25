const defaultError = require('../../../src/formatters/defaultError');
const expect = require('expect');
const test = require('ava');
const chalk = require('chalk');

const noColor = (arr) => arr.map(chalk.stripColor);
const error = { message: 'Error message', file: './src/index.js' };

test('Formats errors with no type', () => {
  expect(noColor(defaultError([error], 'Warning'))).toEqual([
    '1) Warning in ./src/index.js',
    '',
    'Error message',
    '',
  ]);
});

test('Does not format other errors', () => {
  const otherError = { ...error, type: 'other-error' };
  expect(noColor(defaultError([otherError], 'Error'))).toEqual([]);
});
