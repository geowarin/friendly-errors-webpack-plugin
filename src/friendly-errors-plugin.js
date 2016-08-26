'use strict';

const path = require('path');
const chalk = require('chalk');
const os = require('os');
const transformErrors = require('./core/transformErrors');
const formatErrors = require('./core/formatErrors');
const output = require('./output');
const concat = require('./utils').concat;

const defaultTransformers = [
  require('./transformers/babelSyntax'),
  require('./transformers/moduleNotFound'),
  require('./transformers/esLintError'),
];

const defaultFormatters = [
  require('./formatters/moduleNotFound'),
  require('./formatters/defaultError'),
];

class FriendlyErrorsWebpackPlugin {

  constructor (options) {
    options = options || {};
    this.compilationSuccessMessage = options.compilationSuccessMessage;
    this.onErrors = options.onErrors;
    this.shouldClearConsole = options.clearConsole || true;
    this.formatters = concat(defaultFormatters, options.additionalFormatters);
    this.transformers = concat(defaultTransformers, options.additionalTransformers);
  }

  apply (compiler) {

    compiler.plugin('done', stats => {
      this.clearConsole();

      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        this.displaySuccess(stats);
        return;
      }

      if (hasErrors) {
        this.displayErrors(stats.compilation.errors, 'error');
        return;
      }

      if (hasWarnings) {
        this.displayErrors(stats.compilation.warnings, 'warning');
      }
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
    const time = stats.endTime - stats.startTime;
    output.title('success', 'DONE', 'Compiled successfully in ' + time + 'ms');

    if (this.compilationSuccessMessage) {
      output.info(this.compilationSuccessMessage);
    }
  }

  displayErrors(errors, severity) {

    const processedErrors = transformErrors(errors, this.transformers);
    const nbErrors = processedErrors.length;

    const subtitle =  severity === 'error' ? `Failed to compile with ${nbErrors} ${severity}s` : `Compiled with ${nbErrors} ${severity}s`;
    output.title(severity, severity.toUpperCase(), subtitle);

    if (this.onErrors) {
      this.onErrors(severity, processedErrors);
    }

    const topErrors = getMaxSeverityErrors(processedErrors);
    formatErrors(topErrors, this.formatters, severity)
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

module.exports = FriendlyErrorsWebpackPlugin;

function displayCompilationMessage (message, color) {
  output.log();
  output.log(chalk[color](message));
  output.log();
}
