const expect = require('expect');
const test = require('ava');
const debug = require("../src/debug");
const deasync = require('deasync');
var assert = require('assert-diff');

const webpack = deasync(require('webpack'));

test('integration : module-errors', t => {

  debug.capture();
  webpack(require('./fixtures/module-errors/webpack.config.js'));
  assert.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 2 errors',
    '',
    'These dependencies were not found in node_modules:',
    '',
    '* ./non-existing',
    '* not-found',
    '',
    'Did you forget to run npm install --save for them?'
  ]);
  debug.endCapture();
});

test('integration : should display eslint warnings', t => {

  debug.capture();
  webpack(require('./fixtures/eslint-warnings/webpack.config.js'));
  assert.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 1 warnings',
    '',
    '1) Error in ./fixtures/eslint-warnings/index.js',
    '',
    `${__dirname}/fixtures/eslint-warnings/index.js
  1:7  warning  'unused' is defined but never used  no-unused-vars

✖ 1 problem (0 errors, 1 warning)
`,
    ''
  ]);
  debug.endCapture();
});

test('integration : babel syntax error', t => {

  debug.capture();
  webpack(require('./fixtures/babel-syntax/webpack.config'));
  assert.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 1 errors',
    '',
    '1) Error in ./fixtures/babel-syntax/index.js',
    '',
    `Module build failed: SyntaxError: Unexpected token (5:11)

  3 |${' '}
  4 |   render() {
> 5 |     return <div>
    |            ^
  6 |   }
  7 | }`,
    ''
  ]);
  debug.endCapture();
});
