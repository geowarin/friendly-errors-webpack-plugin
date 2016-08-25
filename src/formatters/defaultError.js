const chalk = require('chalk');

function displayError(index, severity, { file, message, origin }) {
  const baseError = chalk.red(`${index + 1}) ${severity}`);

  return [
    `${baseError} ${file ? 'in ' + file : ''}`,
    '',
    message,
    (origin ? origin : undefined),
    ''
  ].filter(chunk => chunk !== undefined);
}

function isDefaultError(error) {
  return !error.type;
}

/**
 * Format errors without a type
 */
function format(errors, type) {
  return errors
    .filter(isDefaultError)
    .reduce((accum, error, i ) => (
      accum.concat(displayError(i, type, error))
    ), []);
}

module.exports = format;
