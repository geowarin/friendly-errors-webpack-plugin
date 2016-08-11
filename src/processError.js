const RequestShortener = require("webpack/lib/RequestShortener");
const requestShortener = new RequestShortener(process.cwd());

function processError(webpackError, transformers) {
  return transformers.reduce((error, transformer) => {
    return transformer(error);
  }, extractError(webpackError));
}

function extractError (e) {
  return {
    message: e.message,
    file: getFile(e),
    origin: getOrigin(e),
    name: e.name,
    severity: 0,
    webpackError: e,
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

module.exports = processError;
