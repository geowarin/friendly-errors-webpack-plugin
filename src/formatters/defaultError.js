'use strict';

const chalk = require('chalk');
const concat = require('../utils').concat;

function displayError(index, severity, error) {
  const baseError = chalk.red(`${index + 1}) ${severity}`);

  return concat(
    `${baseError} ${error.file ? 'in ' + error.file : ''}`,
    '',
    error.message,
    (error.origin ? error.origin : undefined),
    '',
    error.infos
  );
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
