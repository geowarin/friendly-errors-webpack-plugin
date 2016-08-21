const extractError = require('./extractError');

function processErrors(errors, transformers) {
  const transform = (error, transformer) => transformer(error);
  const applyTransformations = (error) => transformers.reduce(transform, error);

  return errors.map(extractError).map(applyTransformations);
}

module.exports = processErrors;
