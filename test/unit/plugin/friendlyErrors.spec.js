const expect = require('expect');
const EventEmitter = require('events');
const Stats = require('webpack/lib/Stats');
const MultiStats = require('webpack/lib/MultiStats');
const Module = require('webpack/lib/Module');
EventEmitter.prototype.plugin = EventEmitter.prototype.on;

const output = require("../../../src/output");
const FriendlyErrorsPlugin = require("../../../index");

var notifierPlugin;
var mockCompiler;

beforeEach(() => {
  notifierPlugin = new FriendlyErrorsPlugin();
  mockCompiler = new EventEmitter();
  notifierPlugin.apply(mockCompiler);
});

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


describe('friendlyErrors : multicompiler', () => {
  it('supplies the correct max compile time across multiple stats', () => {
    const stats1 = successfulCompilationStats({ startTime: 0, endTime: 1000 });
    const stats2 = successfulCompilationStats({ startTime: 2, endTime: 2002 });
    const multistats = new MultiStats([stats1, stats2]);

    const logs = output.captureLogs(() => {
      mockCompiler.emit('done', multistats);
    });

    expect(logs).toEqual([
      'DONE  Compiled successfully in 2000ms',
      ''
    ]);
  });

  it('supplies the correct recompile time with rebuild', () => {
    // Test that rebuilds do not use the prior "max" value when recompiling just one stats object.
    // This ensures the user does not get incorrect build times in watch mode.
    const stats1 = successfulCompilationStats({ startTime: 0, endTime: 1000 });
    const stats2 = successfulCompilationStats({ startTime: 0, endTime: 500 });
    const stats2Rebuild = successfulCompilationStats({ startTime: 1020, endTime: 1050 });

    const multistats = new MultiStats([stats1, stats2]);
    const multistatsRecompile = new MultiStats([stats1, stats2Rebuild]);

    const logs = output.captureLogs(() => {
      mockCompiler.emit('done', multistats);
      mockCompiler.emit('done', multistatsRecompile);
    });

    expect(logs).toEqual([
      'DONE  Compiled successfully in 1000ms',
      '',
      'DONE  Compiled successfully in 30ms',
      ''
    ]);
  });
})

function successfulCompilationStats(opts) {
  const options = Object.assign({ startTime: 0, endTime: 100 }, opts);

  const compilation = {
    errors: [],
    warnings: []
  };
  const stats = new Stats(compilation);
  stats.startTime = options.startTime;
  stats.endTime = options.endTime;
  return stats;
}
