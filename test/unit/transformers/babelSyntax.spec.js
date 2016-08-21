const babelSyntax = require('../../../src/transformers/babelSyntax');
const expect = require('expect');
const test = require('ava');


test('Sets severity to 1000', () => {
  const error = { type: 'babel-syntax-error' };
  expect(babelSyntax(error).severity).toEqual(1000);
});

test('Sets type to babel-syntax-error', () => {
  const error = { name: 'ModuleBuildError', message: 'SyntaxError' };
  expect(babelSyntax(error).type).toEqual('babel-syntax-error');
});

test('Ignores other errors', () => {
  const error = { name: 'OtherError' };
  expect(babelSyntax(error)).toEqual(error);
});
