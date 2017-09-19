'use strict';

const path = require('path');
const chalk = require('chalk');
const os = require('os');
const transformErrors = require('./core/transformErrors');
const formatErrors = require('./core/formatErrors');
const output = require('./output');
const utils = require('./utils');

const concat = utils.concat;
const uniqueBy = utils.uniqueBy;

const defaultTransformers = [
  require('./transformers/babelSyntax'),
  require('./transformers/moduleNotFound'),
  require('./transformers/esLintError'),
];

const defaultFormatters = [
  require('./formatters/moduleNotFound'),
  require('./formatters/eslintError'),
  require('./formatters/defaultError'),
];

const defaultOutputOptions = {
  dateString: {
    color: 'blue',
  },
  took: {
    // can be "ms" or "s"
    on: 'ms',
    // greater than 5000 ms, it will be displayed on red
    // (!) if took.on === 's' then took.red must be on seconds too
    red: 5000,
  },
  displayLastCompile: true,
  displayTook: true,
};

class FriendlyErrorsWebpackPlugin {

  constructor(options) {
    options = options || {};
    this.compilationSuccessInfo = options.compilationSuccessInfo || {};
    this.onErrors = options.onErrors;
    this.shouldClearConsole = options.clearConsole == null ? true : Boolean(options.clearConsole);
    this.formatters = concat(defaultFormatters, options.additionalFormatters);
    this.transformers = concat(defaultTransformers, options.additionalTransformers);
    this.output = Object.assign({}, defaultOutputOptions, options.output);
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      this.clearConsole();

      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        this.displaySuccess(stats);
        return;
      }

      if (hasErrors) {
        this.displayErrors(extractErrorsFromStats(stats, 'errors'), 'error');
        return;
      }

      if (hasWarnings) {
        this.displayErrors(extractErrorsFromStats(stats, 'warnings'), 'warning');
      }

      output.log();

      if(this.output.displayLastCompile) {
        this.displayLastCompile(this.output.dateString.color);
      }

      if(this.output.displayTook){
        this.displayTook(stats, this.output.took);
      }

      output.log();

    });

    compiler.plugin('invalid', () => {
      this.clearConsole();
      output.title('info', 'WAIT', 'Compiling...');
    });
  }

  clearConsole() {
    if (this.shouldClearConsole) {
      output.clearConsole();
    }
  }

  displaySuccess(stats) {
    const time = getCompileTime(stats);
    output.title('success', 'DONE', 'Compiled successfully in ' + time + 'ms');

    if (this.compilationSuccessInfo.messages) {
      this.compilationSuccessInfo.messages.forEach(message => output.info(message));
    }
    if (this.compilationSuccessInfo.notes) {
      output.log();
      this.compilationSuccessInfo.notes.forEach(note => output.note(note));
    }
  }

  displayErrors(errors, severity) {
    const processedErrors = transformErrors(errors, this.transformers);

    const topErrors = getMaxSeverityErrors(processedErrors);
    const nbErrors = topErrors.length;

    const subtitle = severity === 'error' ?
      `Failed to compile with ${nbErrors} ${severity}s` :
      `Compiled with ${nbErrors} ${severity}s`;
    output.title(severity, severity.toUpperCase(), subtitle);

    if (this.onErrors) {
      this.onErrors(severity, topErrors);
    }

    formatErrors(topErrors, this.formatters, severity)
      .forEach(chunk => output.log(chunk));
  }

  displayLastCompile(dateStringColor) {
    const date = new Date();
    const lastCompile = chalk[dateStringColor](date.toLocaleDateString()) + " at " + chalk[dateStringColor](date.toLocaleTimeString());

    output.log("Last compile: " + lastCompile);
  }

  displayTook(stats, tookOptions) {
    let time = getCompileTime(stats);

    if (tookOptions.on === 's') {
      time = time / 1000;
    }

    const took = (time < tookOptions.red) ? chalk.green(time + tookOptions.on) : chalk.red(time + tookOptions.on);

    output.log("Took: " + took);
  }
}

function extractErrorsFromStats(stats, type) {
  if (isMultiStats(stats)) {
    const errors = stats.stats
      .reduce((errors, stats) => errors.concat(extractErrorsFromStats(stats, type)), []);
    // Dedupe to avoid showing the same error many times when multiple
    // compilers depend on the same module.
    return uniqueBy(errors, error => error.message);
  }
  return stats.compilation[type];
}

function getCompileTime(stats) {
  if (isMultiStats(stats)) {
    // Webpack multi compilations run in parallel so using the longest duration.
    // https://webpack.github.io/docs/configuration.html#multiple-configurations
    return stats.stats
      .reduce((time, stats) => Math.max(time, getCompileTime(stats)), 0);
  }
  return stats.endTime - stats.startTime;
}

function isMultiStats(stats) {
  return stats.stats;
}

function getMaxSeverityErrors(errors) {
  const maxSeverity = getMaxInt(errors, 'severity');
  return errors.filter(e => e.severity === maxSeverity);
}

function getMaxInt(collection, propertyName) {
  return collection.reduce((res, curr) => {
    return curr[propertyName] > res ? curr[propertyName] : res;
  }, 0)
}

module.exports = FriendlyErrorsWebpackPlugin;
