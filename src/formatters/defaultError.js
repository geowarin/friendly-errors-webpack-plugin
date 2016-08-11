const chalk = require('chalk');

function displayError(index, severity, error) {
  const displayError = []
  if (error.file) {
    displayError.push(chalk.red((index + 1) + ') ' + severity) + ' in ' + error.file);
  } else {
    displayError.push(chalk.red((index + 1) + ') ' + severity));
  }
  displayError.push('');
  displayError.push(error.message);
  if (error.origin) {
    displayError.push(error.origin);
  }
  displayError.push('');
  return displayError;
}

function isDefaultError(error) {
  return !error.type || error.type === 'babel-syntax-error';
}

function format(errors, type) {
  return errors
    .filter(isDefaultError)
    .reduce((accum, error, i ) => (
      accum.concat(displayError(i, type, error))
    ), []);
}

module.exports = format;
