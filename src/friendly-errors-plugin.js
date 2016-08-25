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

  constructor ({notificationTitle, compilationSuccessMessage, showNotifications} = {}) {
    this.notificationTitle = notificationTitle;
    this.compilationSuccessMessage = compilationSuccessMessage;
    this.notifier = showNotifications && safeRequire('node-notifier');
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
        const time = stats.endTime - stats.startTime;
        debug.log(chalk.green('Compiled successfully in ' + time + 'ms'));

        if (this.compilationSuccessMessage) {
          debug.log(this.compilationSuccessMessage);
        }

      } else if (hasErrors) {

        const { errors } = stats.compilation;
        const processedErrors = transformErrors(errors, transformers);
        const nbErrors = processedErrors.length;
        displayCompilationMessage(`Failed to compile with ${nbErrors} errors`, 'red');

        if (this.notifier) {
          this.notify('Error', processedErrors[0]);
        }

        const topErrors = getMaxSeverityErrors(processedErrors);
        formatErrors(topErrors, formatters, 'Error')
          .forEach((chunk) => debug.log(chunk));

      } else if (hasWarnings) {

        const { warnings } = stats.compilation;
        const processedWarns = transformErrors(warnings, transformers);
        const nbWarning = processedWarns.length;
        displayCompilationMessage(`Compiled with ${nbWarning} warnings`, 'yellow');

        formatErrors(processedWarns, formatters, 'Warning')
          .forEach((chunk) => debug.log(chunk));
      }
    });

    compiler.plugin('invalid', () => {
      debug.clearConsole();
      debug.log(chalk.cyan('Compiling...'));
    });
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
