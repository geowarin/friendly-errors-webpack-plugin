const babelSyntax = require('../../../src/transformers/babelSyntax');
const expect = require('expect');
const test = require('ava');

test('Sets severity to 1000', () => {
  const error = { name: 'ModuleBuildError', message: 'SyntaxError' };
  expect(babelSyntax(error).severity).toEqual(1000);
});

test('Does not set type (it should be handle by the default formatter)', () => {
  const error = { name: 'ModuleBuildError', message: 'SyntaxError' };
  expect(babelSyntax(error).type).toEqual(undefined);
});

test('Ignores other errors', () => {
  const error = { name: 'OtherError' };
  expect(babelSyntax(error)).toEqual(error);
});
