const expect = require('expect');
const test = require('ava');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;

const debug = require("../src/debug");
const FriendlyErrorsPlugin = require("../index");

test('notifier : capture invalid message', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  debug.capture();
  mockCompiler.emit('invalid');
  t.is(debug.capturedMessages.length, 1);
  t.is(debug.capturedMessages[0], 'Compiling...');
  debug.endCapture();
});

test('notifier : capture compilation without errors', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  const compilation = {
    errors: [],
    warnings: []
  };
  const stats = new Stats(compilation);
  stats.startTime = 0;
  stats.endTime = 100;

  debug.capture();
  mockCompiler.emit('done', stats);
  t.is(debug.capturedMessages.length, 1);
  t.is(debug.capturedMessages[0], 'Compiled successfully in 100ms');
  debug.endCapture();
});

test('notifier : capture babel syntax error and clean it', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  const compilation = {
    errors: [{
      name: 'ModuleBuildError',
      message: 'Module build failed: SyntaxError: /Users/geowarin/dev/projects/tarec-js/src/components/App.js: Unexpected token (7:4)\n\u001b[0m  5 |     render\u001b[34m\u001b[1m(\u001b[22m\u001b[39m\u001b[34m\u001b[1m)\u001b[22m\u001b[39m \u001b[32m{\u001b[39m\n  6 |         \u001b[36mreturn\u001b[39m \u001b[1m<\u001b[22mh1\u001b[1m>\u001b[22mHello\u001b[1m<\u001b[22m\u001b[1m/\u001b[22mh1\n> 7 |     \u001b[32m}\u001b[39m\n    |     ^\n  8 | \u001b[32m}\u001b[39m\n  9 | \u001b[0m\n    at Parser.pp.raise (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/location.js:22:13)\n    at Parser.pp.unexpected (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/util.js:89:8)\n    at Parser.pp.expect (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/util.js:83:33)\n    at Parser.pp.jsxParseClosingElementAt (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/plugins/jsx/index.js:406:8)\n    at Parser.pp.jsxParseElementAt (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/plugins/jsx/index.js:426:35)\n    at Parser.pp.jsxParseElement (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/plugins/jsx/index.js:465:15)\n    at Parser.parseExprAtom (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/plugins/jsx/index.js:16:21)\n    at Parser.pp.parseExprSubscripts (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:277:19)\n    at Parser.pp.parseMaybeUnary (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:257:19)\n    at Parser.pp.parseExprOps (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:188:19)\n    at Parser.pp.parseMaybeConditional (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:165:19)\n    at Parser.pp.parseMaybeAssign (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:128:19)\n    at Parser.parseMaybeAssign (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/plugins/flow.js:421:24)\n    at Parser.pp.parseExpression (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/expression.js:92:19)\n    at Parser.pp.parseReturnStatement (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/statement.js:333:26)\n    at Parser.pp.parseStatement (/Users/geowarin/dev/projects/react-cli/node_modules/babylon/lib/parser/statement.js:107:19)',
      file: 'src/myFile.js'
    }],
    warnings: []
  };
  const stats = new Stats(compilation);

  debug.capture();
  mockCompiler.emit('done', stats);
  t.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 1 errors',
    '',
    '1) Error in src/myFile.js',
    '',
    `Module build failed: SyntaxError: /Users/geowarin/dev/projects/tarec-js/src/components/App.js: Unexpected token (7:4)
  5 |     render() {
  6 |         return <h1>Hello</h1
> 7 |     }
    |     ^
  8 | }
  9 | `,
    ''
  ]);
  debug.endCapture();
});

test('notifier : capture a Module not found error', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  const compilation = {
    errors: [{
      name: 'ModuleNotFoundError',
      message: 'Module not found: Error: Can\'t resolve \'reacazet\' in \'/Users/geowarin/dev/projects/tarec-js/src/components\'',
      module: new MockModule({file: '/moduleFile.js'})
    }],
    warnings: []
  };
  const stats = new Stats(compilation);

  debug.capture();
  mockCompiler.emit('done', stats);
  t.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 1 errors',
    '',
    '1) Error in ./moduleFile.js',
    '',
    "Module not found: Error: Can't resolve 'reacazet' in '/Users/geowarin/dev/projects/tarec-js/src/components'",
    ''
  ]);
  debug.endCapture();
});

test('notifier : should display the origin of an error', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  const compilation = {
    errors: [{
      name: 'ModuleNotFoundError',
      message: 'Some error occurred',
      origin: new MockModule({file: '/moduleFile.js', issuer: '/otherModule.js'}),
      dependencies: [{
        loc: {
          start: {line: 36, column: 0},
          end: {line: 36, column: 44}
        }
      }]
    }],
    warnings: []
  };
  const stats = new Stats(compilation);

  debug.capture();
  mockCompiler.emit('done', stats);
  t.deepEqual(debug.capturedMessages, [
    '',
    'Failed to compile with 1 errors',
    '',
    '1) Error',
    '',
    'Some error occurred',
    `@ ./moduleFile.js 36:0-44
 @ ./otherModule.js`,
    ''
  ]);
  debug.endCapture();
});

test('notifier : capture a warning', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  const compilation = {
    errors: [],
    warnings: [{
      name: 'Warning',
      message: 'Some warning',
      file: 'src/myFile.js'
    }]
  };
  const stats = new Stats(compilation);

  debug.capture();
  mockCompiler.emit('done', stats);
  t.deepEqual(debug.capturedMessages, [
    '',
    'Compiled with 1 warnings',
    '',
    '1) Warning in src/myFile.js',
    '',
    'Some warning',
    ''
  ]);
  debug.endCapture();
});

class MockModule extends Module {

  constructor ({issuer, file}) {
    super();
    this.file = file;
    if (issuer) {
      this.issuer = new MockModule({file: issuer});
    }
  }

  readableIdentifier (requestShortener) {
    return requestShortener.shorten(process.cwd() + this.file);
  };
}
