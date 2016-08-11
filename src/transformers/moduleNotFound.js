const TYPE = 'module-not-found';

function cleanStackTrace (message) {
  return message
    .replace(/^\sat\s.*:\d+:\d+[\s\)]*\n/gm, ''); // at ... ...:x:y
}

function isModuleNotFoundError(e) {
  const webpackError = e.webpackError;
  return e.type === TYPE ||
    e.name === 'ModuleNotFoundError' &&
    e.message.indexOf('Module not found') === 0 &&
    webpackError.dependencies && webpackError.dependencies.length;
}

function formatErrors(errors) {
  const displayError = [];
  displayError.push('These dependencies were not found in node_modules:');
  displayError.push('');
  errors.forEach((error, index) => displayError.push(`* ${error.module}`));
  displayError.push('');
  displayError.push('Did you forget to run npm install --save for them?')
  return displayError;
}

module.exports = {
  format: (errors) => {
    const filteredErrors = errors.filter(isModuleNotFoundError);
    return filteredErrors.length > 0 && formatErrors(filteredErrors);
  },
  transform: (error) => {
    const webpackError = error.webpackError;
    if (isModuleNotFoundError(error)) {
      return Object.assign({}, error, {
        message: `Module not found ${webpackError.dependencies[0].request}`,
        module: webpackError.dependencies[0].request,
        type: TYPE,
        severity: 900,
      });
    }

    return error;
  },
};
