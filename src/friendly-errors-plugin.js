'use strict';

const path = require('path');
const chalk = require('chalk');
const os = require('os');
const transformErrors = require('./core/transformErrors');
const formatErrors = require('./core/formatErrors');
const debug = require('./debug');

const transformers = [
  require('./transformers/babelSyntax'),
  require('./transformers/moduleNotFound'),
];

const formatters = [
  require('./formatters/moduleNotFound'),
  require('./formatters/defaultError'),
];

function safeRequire (moduleName) {
  try {
    return require(moduleName);
  } catch (ignored) {}
}

const LOGO = path.join(__dirname, 'tarec_logo_ico.png');

class FriendlyErrorsWebpackPlugin {

  constructor (options) {
    options = options || {};
    this.notificationTitle = options.notificationTitle;
    this.compilationSuccessMessage = options.compilationSuccessMessage;
    this.notifier = options.showNotifications && safeRequire('node-notifier');
  }

  notify (serverity, error) {
    this.notifier.notify({
      title: this.notificationTitle,
      message: serverity + ': ' + error.name,
      subtitle: error.file || '',
      icon: LOGO
    });
  }

  apply (compiler) {

    compiler.plugin('done', stats => {
      debug.clearConsole();

      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        this.displaySuccess(stats);
        return;
      }

      if (hasErrors) {
        this.displayErrors(stats.compilation.errors, 'errors', 'red', this.notifier);
        return;
      }

      if (hasWarnings) {
        this.displayErrors(stats.compilation.warnings, 'warnings', 'yellow');
      }
    });

    compiler.plugin('invalid', () => {
      debug.clearConsole();
      debug.log(chalk.cyan('Compiling...'));
    });
  }

  displaySuccess(stats) {
    const time = stats.endTime - stats.startTime;
    debug.log(chalk.green('Compiled successfully in ' + time + 'ms'));

    if (this.compilationSuccessMessage) {
      debug.log(this.compilationSuccessMessage);
    }
  }

  displayErrors(errors, level, color, notifier) {

    const processedErrors = transformErrors(errors, transformers);
    const nbErrors = processedErrors.length;
    displayCompilationMessage(`Failed to compile with ${nbErrors} ${level}`, color);

    if (notifier) {
      this.notify('Error', processedErrors[0]);
    }

    const topErrors = getMaxSeverityErrors(processedErrors);
    formatErrors(topErrors, formatters, 'Error')
      .forEach((chunk) => debug.log(chunk));
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
  debug.log();
  debug.log(chalk[color](message));
  debug.log();
}
