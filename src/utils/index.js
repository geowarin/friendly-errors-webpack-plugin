/**
 * Concat and flattens non-null values.
 * Ex: concat(1, undefined, 2, [3, 4]) = [1, 2, 3, 4]
 */
function concat() {
  const args = Array.from(arguments).filter(e => e != null);
  const baseArray = Array.isArray(args[0]) ? args[0] : [args[0]];
  return Array.prototype.concat.apply(baseArray, args.slice(1));
}

module.exports = {
  concat: concat
};