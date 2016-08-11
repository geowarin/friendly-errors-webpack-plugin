function formatErrors(errors, formatters, errorType) {
  const formatted = formatters.reduce((output, formatter) => (
    output.concat(formatter(errors, errorType) || [])
  ), []);

  return formatted;
}

module.exports = formatErrors;
