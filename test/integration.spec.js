const expect = require('expect');
const test = require('ava');
const debug = require("../src/debug");
const deasync = require('deasync');

const webpack = deasync(require('webpack'));

test('iteg : module-errors', t => {

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