const formatErrors = require('../../src/core/formatErrors');
const expect = require('expect');
const test = require('ava');

const simple = (errors) => errors
  .filter(({ type }) => !type).map(({ message }) => message);

const allCaps = (errors) => errors
  .filter(({ type }) => type == 'other').map((e) => e.message.toUpperCase());

const notFound = (errors) => errors
  .filter(({ type }) => type === 'not-found').map(() => 'Not found');

const formatters = [allCaps];

test('formats the error based on the matching formatters', () => {
  const errors = [
    { message: 'Error 1', type: undefined },
    { message: 'Error 2', type: 'other' },
    { message: 'Error 3', type: 'not-found' },
  ];

  expect(formatErrors(errors, [simple, allCaps, notFound], 'Error')).toEqual([
    'Error 1',
    'ERROR 2',
    'Not found',
  ]);
});
