function formatErrors(errors) {
  if (errors.length === 0) {
    return;
  }
  const displayError = [];
  displayError.push('These dependencies were not found in node_modules:');
  displayError.push('');
  errors.forEach((error, index) => displayError.push(`* ${error.module}`));
  displayError.push('');
  displayError.push('Did you forget to run npm install --save for them?')
  return displayError;
}

function format(errors) {
  return formatErrors(errors.filter((e) => (
    e.type === 'module-not-found'
  )));
}

module.exports = format;
