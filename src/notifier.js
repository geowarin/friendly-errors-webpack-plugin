const path = require('path');
const chalk = require('chalk');
const os = require('os');
const formatMessage = require('./formatMessage');
const debug = require('./debug');

function safeRequire (moduleName) {
  try {
    return require(moduleName);
  } catch (ignored) {}
}

const LOGO = path.join(__dirname, 'tarec_logo_ico.png');

class FriendlyErrorsWebpackPlugin {

  constructor ({notificationTitle, compilationSuccessMessage, showNotifications}) {
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
        let formattedErrors = stats.compilation.errors.map(formatMessage);
        const nbErrors = formattedErrors.length;
        displayCompilationMessage(`Failed to compile with ${nbErrors} errors`, 'red');

        if (this.notifier) {
          this.notify('Error', formattedErrors[0]);
        }

        formattedErrors = getMaxSeverityErrors(formattedErrors, 'severity');
        if (formattedErrors[0].type === 'module-not-found') {
          debug.log('These dependencies were not found in node_modules:');
          debug.log();
          formattedErrors.forEach((error, index) => debug.log('*', error.module));
          debug.log();
          debug.log('Did you forget to run npm install --save for them?')
        } else {
          formattedErrors.forEach((error, index) => displayError(index, 'Error', error));
        }

        return;
      }

      if (hasWarnings) {
        const formattedWarnings = stats.compilation.warnings.map(formatMessage);
        const nbWarning = formattedWarnings.length;
        displayCompilationMessage(`Compiled with ${nbWarning} warnings`, 'yellow');

        formattedWarnings.forEach((warning, index) => displayError(index, 'Warning', warning));
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
