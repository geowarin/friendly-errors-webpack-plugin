'use strict';

const chalk = require('chalk');

function isEslintError (e) {
  return e.originalStack
    .some(stackframe => stackframe.fileName.indexOf('eslint-loader') > 0);
}

function transform(error) {
  if (isEslintError(error)) {
    return Object.assign({}, error, {
      infos: [
        'You may use special comments to disable some warnings.',
        'Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.',
        'Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.'
      ],
      name: 'Lint error',
    });
  }

  return error;
}

module.exports = transform;
