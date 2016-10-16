const utils = require('../../../src/utils');
const test = require('ava');
const assert = require('assert-diff');

const concat = utils.concat;
const uniqueBy = utils.uniqueBy;

test('concat should concat removing undefined and null values', () => {
  const result = concat(1, undefined, '', null);
  assert.deepEqual(result,
    [1, '']
  );
});

test('concat should handle arrays', () => {
  const result = concat(1, [2, 3], null);
  assert.deepEqual(result,
    [1, 2, 3]
  );
});

test('uniqueBy should dedupe based on criterion returned from iteratee function', () => {
  const result = uniqueBy([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 3 }], function(val) {
    return val.id;
  });
  assert.deepEqual(result, [{ id: 1 }, { id: 2 }, { id: 3 }]);
});
