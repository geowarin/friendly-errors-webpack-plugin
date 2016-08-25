const expect = require('expect');
const test = require('ava');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;

const debug = require("../../../src/debug");
const FriendlyErrorsPlugin = require("../../../index");

test('friendlyErrors : capture invalid message', t => {

  const notifierPlugin = new FriendlyErrorsPlugin();
  var mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);

  debug.capture();
  mockCompiler.emit('invalid');
  t.is(debug.capturedMessages.length, 1);
  t.is(debug.capturedMessages[0], 'Compiling...');
  debug.endCapture();
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

  debug.capture();
  mockCompiler.emit('done', stats);
  t.is(debug.capturedMessages.length, 1);
  t.is(debug.capturedMessages[0], 'Compiled successfully in 100ms');
  debug.endCapture();
});
