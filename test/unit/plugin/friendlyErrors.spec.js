const expect = require('expect');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;

const output = require("../../../src/output");
const FriendlyErrorsPlugin = require("../../../index");

const notifierPlugin = new FriendlyErrorsPlugin();
const mockCompiler = new EventEmitter();
notifierPlugin.apply(mockCompiler);

it('friendlyErrors : capture invalid message', () => {

  const logs = output.captureLogs(() => {
    mockCompiler.emit('invalid');
  });

  expect(logs).toEqual([
    'WAIT  Compiling...',
    ''
    ]);
});

it('friendlyErrors : capture compilation without errors', () => {

  const stats = successfulCompilationStats();
  const logs = output.captureLogs(() => {
    mockCompiler.emit('done', stats);
  });

  expect(logs).toEqual([
    'DONE  Compiled successfully in 100ms',
    ''
  ]);
});

it('friendlyErrors : default clearConsole option', () => {
  const plugin = new FriendlyErrorsPlugin();
  expect(plugin.shouldClearConsole).toBeTruthy()
});

it('friendlyErrors : clearConsole option', () => {
  const plugin = new FriendlyErrorsPlugin({ clearConsole: false });
  expect(plugin.shouldClearConsole).toBeFalsy()
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
