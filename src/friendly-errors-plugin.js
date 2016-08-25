'use strict';

const path = require('path');
const chalk = require('chalk');
const os = require('os');
const transformErrors = require('./core/transformErrors');
const formatErrors = require('./core/formatErrors');
const output = require('./output');

const defaultTransformers = [
  require('./transformers/babelSyntax'),
  require('./transformers/moduleNotFound'),
];

const defaultFormatters = [
  require('./formatters/moduleNotFound'),
  require('./formatters/defaultError'),
];

class FriendlyErrorsWebpackPlugin {

  constructor (options) {
    options = options || {};
    this.compilationSuccessMessage = options.compilationSuccessMessage;
    this.notifier = options.notifier;
    this.formatters = concat(defaultFormatters, options.additionalFormatters);
    this.transformers = concat(defaultTransformers, options.additionalTransformers);
  }

  apply (compiler) {

    compiler.plugin('done', stats => {
      output.clearConsole();

      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        this.displaySuccess(stats);
        return;
      }

      if (hasErrors) {
        this.displayErrors(stats.compilation.errors, 'error', 'red');
        return;
      }

      if (hasWarnings) {
        this.displayErrors(stats.compilation.warnings, 'warning', 'yellow');
      }
    });

    compiler.plugin('invalid', () => {
      output.clearConsole();
      output.log(chalk.cyan('Compiling...'));
    });
  }

  displaySuccess(stats) {
    const time = stats.endTime - stats.startTime;
    output.log(chalk.green('Compiled successfully in ' + time + 'ms'));

    if (this.compilationSuccessMessage) {
      output.log(this.compilationSuccessMessage);
    }
  }

  displayErrors(errors, level, color) {

    const processedErrors = transformErrors(errors, this.transformers);
    const nbErrors = processedErrors.length;
    displayCompilationMessage(`Failed to compile with ${nbErrors} ${level}s`, color);

    if (this.notifier) {
      this.notifier(level, processedErrors);
    }

    const topErrors = getMaxSeverityErrors(processedErrors);
    formatErrors(topErrors, this.formatters, 'Error')
      .forEach((chunk) => output.log(chunk));
  }
}

function getMaxSeverityErrors (errors) {
  const maxSeverity = getMaxInt(errors, 'severity');
  return errors.filter(e => e.severity === maxSeverity);
}

function getMaxInt(collection, propertyName) {
  return collection.reduce((res, curr) => {
    return curr[propertyName] > res ? curr[propertyName] : res;
  }, 0)
}

/**
 * Concat and flattens non-null values. First arg must be an array.
 * Ex: concat([1], undefined, 2, [3, 4]) = [1, 2, 3, 4]
 */
function concat() {
  var args = Array.from(arguments).filter(e => e);
  return Array.prototype.concat.apply(args[0], args.slice(1));
}

module.exports = FriendlyErrorsWebpackPlugin;

function displayCompilationMessage (message, color) {
  output.log();
  output.log(chalk[color](message));
  output.log();
}
