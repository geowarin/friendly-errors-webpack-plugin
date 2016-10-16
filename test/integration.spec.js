const test = require('ava');
const output = require('../src/output');
const deasync = require('deasync');
const assert = require('assert-diff');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('../src/friendly-errors-plugin');

const syncWebpack = deasync(webpack);

// Applys plugin directly to compiler to support `MultiCompiler` tests.
const syncWebpackWithPlugin = deasync(function(config, fn) {
  const compiler = webpack(config);
  compiler.apply(new FriendlyErrorsWebpackPlugin());
  compiler.run(fn);
  return compiler;
});

test('integration : success', t => {

  var logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/success/webpack.config'));
  });

  assert(
    /DONE  Compiled successfully in (.\d*)ms/.test(logs),
    'Expected logs to include \'DONE  Compiled successfully in {{number}}ms\''
  );
});


test('integration : module-errors', t => {

  var logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/module-errors/webpack.config.js'));
  });

  assert.deepEqual(logs, [
    ' ERROR  Failed to compile with 2 errors',
    '',
    'These dependencies were not found in node_modules:',
    '',
    '* ./non-existing',
    '* not-found',
    '',
    'Did you forget to run npm install --save for them?'
  ]);
});

test('integration : should display eslint warnings', t => {

  var logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/eslint-warnings/webpack.config.js'));
  });

  assert.deepEqual(logs, [
    ' WARNING  Compiled with 1 warnings',
    '',
    ' warning  in ./fixtures/eslint-warnings/index.js',
    '',
    `${__dirname}/fixtures/eslint-warnings/index.js
  1:7  warning  'unused' is defined but never used  no-unused-vars

✖ 1 problem (0 errors, 1 warning)
`,
    '',
    'You may use special comments to disable some warnings.',
    'Use // eslint-disable-next-line to ignore the next line.',
    'Use /* eslint-disable */ to ignore all warnings in a file.'
  ]);
});

test('integration : babel syntax error', t => {

  var logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/babel-syntax/webpack.config'));
  });

  assert.deepEqual(logs, [
    ' ERROR  Failed to compile with 1 errors',
    '',
    ' error  in ./fixtures/babel-syntax/index.js',
    '',
    `SyntaxError: Unexpected token (5:11)

  3 |${' '}
  4 |   render() {
> 5 |     return <div>
    |            ^
  6 |   }
  7 | }`,
    ''
  ]);
});

test('integration : webpack multi compiler : success', t => {

  var logs = output.captureLogs(() => {
    syncWebpackWithPlugin(require('./fixtures/multi-compiler-success/webpack.config'));
  });

  assert(
    /DONE  Compiled successfully in (.\d*)ms/.test(logs),
    'Expected logs to include \'DONE  Compiled successfully in {{number}}ms\''
  );
});

test('integration : webpack multi compiler : module-errors', t => {

  var logs = output.captureLogs(() => {
    syncWebpackWithPlugin(require('./fixtures/multi-compiler-module-errors/webpack.config'));
  });

  assert.deepEqual(logs, [
    ' ERROR  Failed to compile with 2 errors',
    '',
    'These dependencies were not found in node_modules:',
    '',
    '* ./non-existing',
    '* not-found',
    '',
    'Did you forget to run npm install --save for them?'
  ]);
});
