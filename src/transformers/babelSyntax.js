function cleanStackTrace(message) {
  return message
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, ''); // at ... ...:x:y
}

function isBabelSyntaxError(e) {
  return e.name === 'ModuleBuildError' &&
    e.message.indexOf('SyntaxError') >= 0;
}

function transform(error) {
  if (isBabelSyntaxError(error)) {
    return Object.assign({}, error, {
      message: cleanStackTrace(error.message + '\n'),
      severity: 1000,
    });
  }

  return error;
}

module.exports = transform;
