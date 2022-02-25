// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const util = require('util')

/** Default options passed on to the logger. */
const defaultOptions = {
  logDepth: 6,
  logMaxLength: null,
  logBreakLength: 120,
  logFn: console.log,
  mapFns: null,
  colorize: true
}

/**
 * Returns a dump of the contents of an object.
 * 
 * This is used to log the contents of non-string objects.
 */
const inspectObject = (obj, callerOptions = {}) => {
  const opts = {...defaultOptions, ...callerOptions}
  return util.inspect(obj, {
    colors: opts.colorize,
    depth: opts.logDepth,
    maxArrayLength: opts.logMaxLength,
    breakLength: opts.logBreakLength,
    ...opts
  })
}

/**
 * Returns a dump of the contents of an object, without colors.
 */
const inspectObjectPlainText = obj => inspectObject(obj, {colorize: false})

module.exports = {
  defaultOptions,
  inspectObject,
  inspectObjectPlainText
}
