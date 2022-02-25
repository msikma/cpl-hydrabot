// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const chalk = require('chalk')
const chalkTemplate = require('chalk-template')

const {getDateForLogger} = require('./time')
const {isString, isTemplateLiteral} = require('./types')
const {stripEscapeSeq} = require('./text')
const {progKill} = require('./program')
const {createErrorEmbed} = require('./embed')
const {inspectObject, defaultOptions} = require('./inspect')

/**
 * Adds timestamps to each line of a log string.
 */
const addTimestamps = str => {
  const date = getDateForLogger()
  const prefix = `${chalk.gray.dim('[')}${chalk.gray(date)}${chalk.gray.dim(']')}`
  const lines = str.split('\n').map(l => `${prefix} ${l}`)
  return lines.join('\n')
}

/**
 * Adds a > (greater than) sign to each line.
 */
const addQuotes = str => {
  const lines = str.split('\n').map(l => `${chalk.gray('>')} ${l}`)
  return lines.join('\n')
}

/**
 * Adds a > (greater than) sign to each line.
 */
const addSingleQuote = str => {
  return `${chalk.gray('>')} ${str}`
}

/**
 * Creates strings representing the contents of a given list of segments, and passes them on to a logging function.
 * 
 * This function does the bulk of the actual logging work. Essentially this is similar to what console.log() does
 * on Node, but with increased flexibility and the ability to detect and format tagged template literals.
 * 
 * This way, a logging function can be used as either log(...args), or as log`tagged template literal`.
 * 
 * When a tagged template literal is used, colors can be assigned to the output using the chalkTemplate format,
 * such as log`Test: {red this text is red}, and {blue.bold this text is blue and bold}.`
 */
const logSegments = (segments, callerOptions = {}) => {
  const opts = {...defaultOptions, ...callerOptions}
  const logFn = opts.logFn || (str => str)
  const mapFns = (opts.mapFns || []).filter(fn => fn)

  let formattedString

  // Pass on tagged template literals to chalkTemplate().
  if (isTemplateLiteral(segments)) {
    formattedString = chalkTemplate(...segments)
  }
  // Anything else is handled like console.log() handles it; strings get output directly,
  // and everything else is passed into inspectObject().
  else {
    formattedString = segments.map((obj, n) => {
      // Add spaces between items, except after a linebreak.
      const space = (n !== segments.length - 1 && !String(segments[n]).endsWith('\n') ? ' ' : '')
      return `${isString(obj) ? obj : inspectObject(obj)}${space}`
    }).join('')
  }

  // Pass the result through any post-processing functions we may have, then pass it to the log function.
  return logFn(mapFns.reduce((str, fn) => fn(str), formattedString))
}

/**
 * Creates a logger function that can be called directly or through one of its methods.
 * 
 * The logger object will be able to log locally (to stdout) and to an external function (such as Discord).
 * 
 * The logger will have the following features:
 * 
 *     <return value>()    calls the logger directly with default options
 *     .local()            logs only locally
 *     .remote()           logs only remotely
 *     .deactivate()       makes all calls no-op
 *     .activate()         reverses .deactivate()
 *     .setRemoteLogger    sets a function to be called for remote logging
 * 
 * A log function can be called as a function or used with tagged template literals:
 * 
 *     log('this is a regular log call which takes strings, objects, or anything else', myObject, 'and more text')
 *     log`this is a tagged template literal call which lets you {blue use shorthand syntax for colors}.`
 * 
 * When a remote logger is set, it will be called for each log call alongside the local function.
 * The typical use for this is to first only log to stdout, until a connection to Discord has been made,
 * at which point all logs get mirrored to the Discord log channel.
 * 
 * Local logging uses colors (terminal escape sequences), which Discord does not support, so the remote logger
 * additionally gets a copy of what the local logger will output, stripped of escape sequences.
 * 
 * Each logger (local and remote) may have its own set of options that gets passed on to logSegments(),
 * which does the actual logging work. Remote logging can be turned off completely for a specific logger
 * (even if .setRemoteLogger() is called) by passing 'isOnlyLocal' in the remote options.
 */
function makeLogger(localOpts = {}, remoteOpts = {}) {
  const state = {
    // If false, all logs (local and remote) are no-ops.
    isActive: true,
    // If true, remote logging is always a no-op even if 'remoteLogger' is set.
    isOnlyLocal: remoteOpts.isOnlyLocal,
    // If null, remote logging is a no-op.
    remoteLogger: null,
    // Whether the last log was a query. This is used to implement padding.
    lastLogWasQuery: false
  }

  /**
   * Pads a log segment by adding a linebreak to the start or the end.
   * 
   * This is used to pad queries, and to pad the first line after a query.
   */
  const padQuery = (pad, padStart = true) => str => {
    if (!pad) return str
    if (padStart) return `\n${addSingleQuote(`\n${str}`)}`
    if (!padStart) return `${addSingleQuote(`\n`)}\n${str}`
  }
  
  /**
   * Logs the arguments passed by the user.
   * 
   * The log may be either anything one can pass to console.log(), or a tagged template literal.
   * 
   * The 'isQuery' option is for logging database queries and adds extra padding.
   * The 'isRaw' option sends a message directly to the channel without filtering or text formatting.
   * The 'isErrorObject' option uses special formatting for error objects.
   */
  const logFunction = (logLocal = true, logRemote = true, isQuery = false, isRaw = false, isErrorObject = false) => (...segments) => {
    if (!state.isActive) return

    // When calling errorObject(), 'isErrorObject' will be true. This 
    // When logging an error object, we'll rewrite the segments.
    // It's expected that errorObject logs will have 
    if (isErrorObject) {
      segments = [{embeds: [createErrorEmbed(...segments)]}]
      isRaw = true
    }

    // The remote logger, if it's set, is called with a different set of arguments than the local logger.
    // Since the remote logger isn't a terminal, and doesn't necessarily only work with strings,
    // we'll provide it with two things: an ANSI-stripped copy of what the local logger will get,
    // and a copy of the raw input provided by the user making the log() call.
    // Additionally, we'll pass on either the former or the latter as the first argument, depending
    // on whether the logger was called with a tagged template literal.
    if (logRemote && state.remoteLogger && !state.isOnlyLocal) {
      // If we're sending a raw message to the logging channel, skip filtering or text formatting.
      // Every log segment is assumed to be a BaseMessageOptions object.
      if (isRaw) {
        state.remoteLogger(segments, {logRawSegments: segments, logPlainText: null, options: remoteOpts, isRaw})
      }
      // Otherwise, generate a log message using our usual options.
      else {
        const logIsTemplateLiteral = isTemplateLiteral(segments)
        const logPlainText = stripEscapeSeq(logSegments(segments, {...remoteOpts, logFn: null}))
        state.remoteLogger(logIsTemplateLiteral ? [logPlainText] : segments, {logRawSegments: segments, logPlainText, options: remoteOpts})
      }
    }

    // Log locally (to stdout, most likely).
    // Note: when we log a query, our 'segments' argument is always an array containing a single string.
    // To implement padding, we add a single linebreak to the start.
    if (logLocal) {
      const quoteFn = padQuery(state.lastLogWasQuery !== isQuery, isQuery)
      state.lastLogWasQuery = isQuery
      return logSegments(segments, {...localOpts, mapFns: [quoteFn, ...localOpts.mapFns]})
    }
  }

  const logger = logFunction()
  logger.errorObject = logFunction(true, true, false, false, true)
  logger.localQuery = logFunction(true, false, true)
  logger.local = logFunction(true, false)
  logger.remote = logFunction(false, true)
  logger.remoteRaw = logFunction(false, true, false, true)
  logger.deactivate = () => state.isActive = false
  logger.activate = () => state.isActive = true
  logger.setRemoteLogger = remoteLogger => state.remoteLogger = remoteLogger
  return logger
}

/** All basic logging functions. */
const log = makeLogger({mapFns: [addTimestamps]})
const logInfo = makeLogger({mapFns: [addTimestamps, chalk.cyan]})
const logWarn = makeLogger({mapFns: [addTimestamps, chalk.yellow]})
const logError = makeLogger({mapFns: [addTimestamps, chalk.red], logFn: console.error})
const logFormat = chalkTemplate
const inspect = makeLogger({logFn: null}, {isOnlyLocal: true})

/** Exits the program with an error; works like log() otherwise. */
const die = makeLogger({
  mapFns: [addTimestamps, chalk.red],
  logFn: string => {
    console.error(string)
    progKill(1)
  }
}, {type: 'logError'})

module.exports = {
  log,
  logInfo,
  logWarn,
  logError,
  logFormat,
  inspect,
  die,
  addTimestamps,
  addQuotes,
  addSingleQuote
}
