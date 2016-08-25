const expect = require('expect');
const test = require('ava');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;
var assert = require('assert-diff');

const output = require("../../../src/output");
const FriendlyErrorsPlugin = require("../../../index");

test('friendlyErrors : capture invalid message', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  var logs = output.captureLogs(() => {
    mockCompiler.emit('invalid');
  });

  assert.deepEqual(logs,
    ['Compiling...']
  );
});

test('friendlyErrors : capture compilation without errors', t => {

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

  var logs = output.captureLogs(() => {
    mockCompiler.emit('done', stats);
  });

  assert.deepEqual(logs, [
    'Compiled successfully in 100ms'
  ]);
});
