const output = require('../src/output');
const deasync = require('deasync');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('../src/friendly-errors-plugin');
const MemoryFileSystem = require('memory-fs');

const syncWebpack = deasync(function(config, fn) {
  const compiler = webpack(config);
  compiler.outputFileSystem = new MemoryFileSystem();
  compiler.run(fn);
  return compiler;
});

// Applys plugin directly to compiler to support `MultiCompiler` tests.
const syncWebpackWithPlugin = deasync(function(config, fn) {
  const compiler = webpack(config);
  compiler.outputFileSystem = new MemoryFileSystem();
  compiler.apply(new FriendlyErrorsWebpackPlugin());
  compiler.run(fn);
  return compiler;
});

it('integration : success', () => {

  const logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/success/webpack.config'));
  });

  expect(logs.join('\n')).toMatch(/DONE  Compiled successfully in (.\d*)ms/);
});


it('integration : module-errors', () => {

  const logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/module-errors/webpack.config.js'));
  });

  expect(logs).toEqual([
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

it('integration : should display eslint warnings', () => {

  const logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/eslint-warnings/webpack.config.js'));
  });

  expect(logs).toEqual([
    ' WARNING  Compiled with 1 warnings',
    '',
    ' warning  in ./test/fixtures/eslint-warnings/index.js',
    '',
    `${__dirname}/fixtures/eslint-warnings/index.js
  1:7  warning  'unused' is assigned a value but never used  no-unused-vars

✖ 1 problem (0 errors, 1 warning)
`,
    '',
    'You may use special comments to disable some warnings.',
    'Use // eslint-disable-next-line to ignore the next line.',
    'Use /* eslint-disable */ to ignore all warnings in a file.'
  ]);
});

it('integration : babel syntax error', () => {

  const logs = output.captureLogs(() => {
    syncWebpack(require('./fixtures/babel-syntax/webpack.config'));
  });

  expect(logs).toEqual([
    ' ERROR  Failed to compile with 1 errors',
    '',
    ' error  in ./test/fixtures/babel-syntax/index.js',
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

it('integration : webpack multi compiler : success', () => {

  const logs = output.captureLogs(() => {
    syncWebpackWithPlugin(require('./fixtures/multi-compiler-success/webpack.config'));
  });

  expect(logs.join('\n')).toMatch(/DONE  Compiled successfully in (.\d*)ms/)
});

it('integration : webpack multi compiler : module-errors', () => {

  const logs = output.captureLogs(() => {
    syncWebpackWithPlugin(require('./fixtures/multi-compiler-module-errors/webpack.config'));
  });

  expect(logs).toEqual([
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
