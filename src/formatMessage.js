const RequestShortener = require("webpack/lib/RequestShortener");
const requestShortener = new RequestShortener(process.cwd());

function cleanStackTrace (message) {
  return message
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, ''); // at ... ...:x:y
}

function isBabelSyntaxError (e) {
  return e.name === 'ModuleBuildError' && e.message.indexOf('SyntaxError') >= 0;
}

function isModuleNotFoundError (e) {
  return e.name === 'ModuleNotFoundError'
    && e.message.indexOf('Module not found') === 0
    && e.dependencies && e.dependencies.length;
}

function formatMessage (webpackError) {

  const error = extractError(webpackError);
  if (isBabelSyntaxError(webpackError)) {
    error.message = cleanStackTrace(error.message + '\n');
    error.type = 'babel-syntax-error';
    error.severity = 1000;
  } else if (isModuleNotFoundError(webpackError)) {
    error.message = `Module not found ${webpackError.dependencies[0].request}`;
    error.module = webpackError.dependencies[0].request;
    error.type = 'module-not-found';
    error.severity = 900;
  } else {
    error.severity = 0;
  }

  return error;
}

function extractError (e) {
  return {
    message: e.message,
    file: getFile(e),
    origin: getOrigin(e),
    name: e.name
  };
}


function getFile (e) {
  if (e.file) {
    return e.file;
  } else if (e.module && e.module.readableIdentifier && typeof e.module.readableIdentifier === "function") {
    return e.module.readableIdentifier(requestShortener);
  }
}

function getOrigin (e) {
  let origin = '';
  if (e.dependencies && e.origin) {
    origin += '\n @ ' + e.origin.readableIdentifier(requestShortener);
    e.dependencies.forEach(function (dep) {
      if (!dep.loc) return;
      if (typeof dep.loc === "string") return;
      if (!dep.loc.start) return;
      if (!dep.loc.end) return;
      origin += ' ' + dep.loc.start.line + ':' + dep.loc.start.column + '-' +
        (dep.loc.start.line !== dep.loc.end.line ? dep.loc.end.line + ':' : '') + dep.loc.end.column;
    });
    var current = e.origin;
    while (current.issuer) {
      current = current.issuer;
      origin += '\n @ ' + current.readableIdentifier(requestShortener);
    }
  }
  return origin;
}

module.exports = formatMessage;
