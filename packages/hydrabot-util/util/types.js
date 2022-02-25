// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/** Returns true for objects (such as {} or new Object()), false otherwise. */
const isPlainObject = obj => obj != null && typeof obj === 'object' && obj.constructor === Object

/** Checks whether something is a string. */
const isString = obj => typeof obj === 'string' || obj instanceof String

/** Checks whether something is an integer. */
const isInteger = obj => Number.isInteger(obj)

/** Checks whether something is any type of number (excluding NaN). */
const isNumber = obj => !isNaN(obj) && Object.prototype.toString.call(obj) === '[object Number]'

/** Checks whether something is an array. */
const isArray = Array.isArray

/** Checks whether something is an Error. */
const isError = obj => Object.prototype.toString.call(obj) === '[object Error]'

/** Checks whether something is a function. */
const isFunction = obj => typeof obj === 'function'

/** Checks whether an argument is (likely to be) a template literal. */
const isTemplateLiteral = obj => Array.isArray(obj) && Array.isArray(obj[0]) && Array.isArray(obj[0]?.raw) && Object.isFrozen(obj[0])

module.exports = {
  isArray,
  isError,
  isFunction,
  isInteger,
  isNumber,
  isPlainObject,
  isString,
  isTemplateLiteral
}
