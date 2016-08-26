const concat = require('../../../src/utils').concat;
const test = require('ava');
var assert = require('assert-diff');

test('should concat removing undefined and null values', () => {
  var result = concat(1, undefined, '', null);
  assert.deepEqual(result,
    [1, '']
  );
});

test('should handle arrays', () => {
  var result = concat(1, [2, 3], null);
  assert.deepEqual(result,
    [1, 2, 3]
  );
});
