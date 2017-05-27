'use strict';

const concat = require('../utils').concat;

function displayError(error) {
  return [error.webpackError, ''];
}

function format(errors) {
  const lintErrors = errors.filter(e => e.type === 'webpack-error');
  if (lintErrors.length > 0) {
    const flatten = (accum, curr) => accum.concat(curr);
    return concat(
      lintErrors
        .map(error => displayError(error))
        .reduce(flatten, [])
    );
  }

  return [];
}

module.exports = format;