function formatErrors(errors, formatters, errorType) {
  return formatters.reduce((output, formatter) => {
    if (!output) {
      return formatter(errors, errorType);
    }

    return output;
  }, null);
}

module.exports = formatErrors;
