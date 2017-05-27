'use strict';

function isWebpackError (e) {
  return  !Array.isArray(e.originalStack) && e.hasOwnProperty('webpackError');
}

function transform(error) {
  if (isWebpackError(error)) {
    return Object.assign({}, error, {
      name: 'Webpack error',
      type: 'webpack-error'
    });
  }

  return error;
}

module.exports = transform;