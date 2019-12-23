'use strict';

const TYPE = 'module-not-found';

function isModuleNotFoundError (e) {
  const webpackError = e.webpackError || {};
  return webpackError.dependencies
    && webpackError.dependencies.length > 0
    && e.name === 'ModuleNotFoundError'
    && e.message.indexOf('Module not found') === 0;
}

function transform(error) {
  const webpackError = error.webpackError;
  if (isModuleNotFoundError(error)) {
    const dependency = webpackError.dependencies[0];
    const module = dependency.request || dependency.options.request;
    return Object.assign({}, error, {
      message: `Module not found ${module}`,
      type: TYPE,
      severity: 900,
      module: module || extractModuleName(webpackError.message || ''),
      name: 'Module not found'
    });
  }

  return error;
}

const re = /Can't resolve '([^']*)'/

function extractModuleName(message) {
  const matches = message.match(re)

  if (matches && matches[1]) {
    return matches[1]
  }
}

module.exports = transform;
