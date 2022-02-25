// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/**
 * Async array filter implementation.
 * 
 * Runs asyncMap() and then filters the result synchronously.
 */
const asyncFilter = async (arr, predicate) => {
  const results = await asyncMap(arr, predicate)
  return arr.filter((_, index) => results[index])
}

/**
 * Async array map implementation.
 */
const asyncMap = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate))
  return results
}

/**
 * Wraps a function in a try..catch block and returns a fallback value if an error occurs.
 * 
 * This will silently catch any kind of error.
 */
const tryCatch = (fn, fallbackValue) => {
  return async (...args) => {
    try {
      return await fn(...args)
    }
    catch {
      return fallbackValue
    }
  }
}

/**
 * Omits nullish values and arrays of length 0 from an object.
 */
const omitEmpty = obj => {
  const ret = {}
  for (const [key, value] of Object.entries(obj)) {
    if ((value.length == null && value) || (value.length != null && value.length > 0)) {
      ret[key] = value
    }
  }
  return ret
}

/**
 * Zips multiple arrays into one.
 * 
 * A fallback value can be set; if the first array is longer than subsequent arrays,
 * the missing values will be replaced by the fallback.
 * 
 * The longest array should be first; subsequent arrays with longer length than the first
 * will have the extra values ignored.
 */
const zipArrays = (fallback = null) => (...objs) => {
  return objs[0].flatMap((obj, n) => [obj, ...objs.slice(1).map(subObj => subObj[n] ?? fallback)])
}

/** Wraps anything in an array if it isn't one already. */
const wrapInArray = obj => Array.isArray(obj) ? obj : [obj]

/** Checks whether a string is pure whitespace. */
const isWhitespace = str => str.trim() === ''

module.exports = {
  asyncFilter,
  asyncMap,
  isWhitespace,
  tryCatch,
  wrapInArray,
  omitEmpty,
  zipArrays
}
