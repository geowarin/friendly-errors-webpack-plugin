const path = require('path');
const chalk = require('chalk');
const os = require('os');
const processErrors = require('./processError');
const debug = require('./debug');

const transformers = [
  require('./transformers/babelSyntax').transform,
  require('./transformers/moduleNotFound').transform,
];

const formatters = [
  require('./transformers/moduleNotFound').format,
  require('./transformers/genericError').format,
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
        return;
      }

      if (hasErrors) {
        let processedErrors = processErrors(stats.compilation.errors, transformers);
        const nbErrors = processedErrors.length;
        displayCompilationMessage(`Failed to compile with ${nbErrors} errors`, 'red');

        if (this.notifier) {
          this.notify('Error', processedErrors[0]);
        }

        processedErrors = getMaxSeverityErrors(processedErrors, 'severity');
        let formattedErrors = formatters.reduce((output, formatter) => {
          if (!output) {
            return formatter(processedErrors, 'Error');
          }

          return output;
        }, null);

        formattedErrors.map((errorSection) => debug.log(errorSection));
        return;
      }

      if (hasWarnings) {
        const processedWarns = processErrors(stats.compilation.warnings, transformers);
        const nbWarning = processedWarns.length;
        displayCompilationMessage(`Compiled with ${nbWarning} warnings`, 'yellow');

        let formattedWarning = formatters.reduce((output, formatter) => {
          if (!output) {
            return formatter(processedWarns, 'Warning');
          }

          return output;
        }, null);

        formattedWarning.map((errorSection) => debug.log(errorSection));
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

function displayError (index, severity, error) {
  if (error.file) {
    debug.log(chalk.red((index + 1) + ') ' + severity) + ' in ' + error.file);
  } else {
    debug.log(chalk.red((index + 1) + ') ' + severity));
  }
  debug.log();
  debug.log(error.message);
  if (error.origin) {
    debug.log(error.origin);
  }
  debug.log();
}

function displayCompilationMessage (message, color) {
  debug.log();
  debug.log(chalk[color](message));
  debug.log();
}
