const chalk = require('chalk');

function displayError (index, severity, error) {
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

function isGenericError(error) {
  return !error.type || error.type === 'babel-syntax-error';
}

module.exports = {
  format: (errors, type) => {
    return errors
      .filter(isGenericError)
      .reduce((accum, error, i ) => (
        accum.concat(displayError(i, type, error))
      ), []);
  },
};
