const expect = require('expect');
const test = require('ava');
const debug = require("../src/debug");
const deasync = require('deasync');

const webpack = deasync(require('webpack'));

test('integration : module-errors', t => {

  debug.capture();
  webpack(require('./fixtures/module-errors/webpack.config.js'));
  expect(debug.capturedMessages).toEqual([
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

test('integration : babel syntax error', t => {

  debug.capture();
  webpack(require('./fixtures/babel-syntax/webpack.config'));
  expect(debug.capturedMessages).toEqual([
    '',
    'Failed to compile with 1 errors',
    '',
    '1) Error in ./fixtures/babel-syntax/index.js',
    '',
    `Module build failed: SyntaxError: /Users/geowarin/dev/projects/friendly-errors-webpack-plugin/test/fixtures/babel-syntax/index.js: Unexpected token (5:11)
  3 | 
  4 |   render() {
> 5 |     return <div>
    |            ^
  6 |   }
  7 | }`,
    ''
  ]);
  debug.endCapture();
});