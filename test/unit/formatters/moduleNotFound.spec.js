const moduleNotFound = require('../../../src/formatters/moduleNotFound');
const expect = require('expect');
const test = require('ava');

test('Formats module-not-found errors', () => {
  const error = { type: 'module-not-found', module: 'redux' };
  expect(moduleNotFound([error])).toEqual([
    'This dependency was not found in node_modules:',
    '',
    '* redux',
    '',
    'Did you forget to run npm install --save for it?'
  ]);
});

test('Groups all module-not-found into one', () => {
  const reduxError = { type: 'module-not-found', module: 'redux' };
  const reactError = { type: 'module-not-found', module: 'react' };
  expect(moduleNotFound([reduxError, reactError])).toEqual([
    'These dependencies were not found in node_modules:',
    '',
    '* redux',
    '* react',
    '',
    'Did you forget to run npm install --save for them?'
  ]);
});

test('Does not format other errors', () => {
  const otherError = { type: 'other-error', module: 'foo' };
  expect(moduleNotFound([otherError])).toEqual([]);
});
