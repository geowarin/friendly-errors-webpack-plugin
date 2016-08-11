const TYPE = 'module-not-found';

function isModuleNotFoundError(e) {
  const webpackError = e.webpackError;
  return e.type === TYPE ||
    e.name === 'ModuleNotFoundError' &&
    e.message.indexOf('Module not found') === 0 &&
    webpackError.dependencies && webpackError.dependencies.length;
}

function transform(error) {
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
}

module.exports = transform;
