const expect = require('expect');
const test = require('ava');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;
var assert = require('assert-diff');

const output = require("../../../src/output");
const FriendlyErrorsPlugin = require("../../../index");

const notifierPlugin = new FriendlyErrorsPlugin();
var mockCompiler = new EventEmitter();
notifierPlugin.apply(mockCompiler);

test('friendlyErrors : capture invalid message', t => {

  var logs = output.captureLogs(() => {
    mockCompiler.emit('invalid');
  });

  assert.deepEqual(logs, [
    ' WAIT  Compiling...',
    ''
    ]
  );
});

test('friendlyErrors : capture compilation without errors', t => {

  var stats = successfulCompilationStats();
  var logs = output.captureLogs(() => {
    mockCompiler.emit('done', stats);
  });

  assert.deepEqual(logs, [
    ' DONE  Compiled successfully in 100ms',
    ''
  ]);
});

test('friendlyErrors : default clearConsole option', t => {
  const plugin = new FriendlyErrorsPlugin();
  assert.strictEqual(plugin.shouldClearConsole, true)
});

test('friendlyErrors : clearConsole option', t => {
  const plugin = new FriendlyErrorsPlugin({ clearConsole: false });
  assert.strictEqual(plugin.shouldClearConsole, false)
});

function successfulCompilationStats() {
  const compilation = {
    errors: [],
    warnings: []
  };
  const stats = new Stats(compilation);
  stats.startTime = 0;
  stats.endTime = 100;
  return stats;
}
