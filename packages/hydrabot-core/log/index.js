// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {isString, isNumber, isPlainObject, isError, inspectObjectPlainText, createMessageEmbed, omitEmpty} = require('hydrabot-util')

/**
 * Log levels and their shortcut labels.
 * 
 *     color     The color used for any embed in the log message
 *     useEmbed  Forces all log text, even plaintext, to be wrapped in an embed
 *     isError   Whether the log should be sent to the error log channel instead of the regular log channel
 */
const logLevels = {
  logError: {color: '#ff034a', isError: true, useEmbed: true},
  logWarn: {color: '#ffaa02', useEmbed: true},
  logInfo: {color: '#00aff4', useEmbed: true},
  logRegular: {color: '#424555'}
}

/**
 * Creates logging functions for Discord for a specific command (or the system).
 */
const createLogFunctions = (callerManifest, logChannel, logErrorChannel) => {
  const levelFactory = logLevelFactory(callerManifest, logChannel, logErrorChannel)
  const logFunctions = {}
  for (const [name, level] of Object.entries(logLevels)) {
    logFunctions[name] = levelFactory(level)
  }
  return logFunctions
}

/**
 * Returns whether an object is embeddable in a Discord message.
 */
const isEmbeddableObject = obj => {
  return isPlainObject(obj) || isError(obj)
}

/**
 * Turns a log segment into a string.
 */
const toLoggableString = obj => {
  if (isString(obj) || isNumber(obj)) return obj.toString()
  return inspectObjectPlainText(obj)
}

/**
 * Turns a log segment into a MessageEmbed.
 */
const toLoggableEmbed = (obj, logLevel, callerData, isPlainString) => {
  const embed = createMessageEmbed(obj, logLevel, callerData, isPlainString)
  embed.setColor(logLevel.color)
  return embed
}

/**
 * Returns an array of object and text groupings.
 * 
 * This is done because we can only log one text message and up to 10 embeds per line,
 * so if a log call contains multiple of those we need to send multiple lines.
 * 
 * If 'useEmbeds' is true, all regular text becomes an embed.
 * 
 * Note that text always comes before an embed on Discord, so if an embeddable log segment
 * comes before a piece of text, the text is pushed to the next group.
 */
const makeMessageGroups = (logSegments, logLevel, callerData, maxEmbeds = 10) => {
  let group = {}
  const groups = []
  const pushGroup = () => {
    if (group.content?.length > 0 || group.embeds?.length > 0) {
      groups.push(group)
    }
    group = {content: [], embeds: []}
  }

  pushGroup()

  for (const item of logSegments) {
    const isEmbeddable = isEmbeddableObject(item)
    const isPlainString = isString(item)
    if (isEmbeddable || (isPlainString && logLevel.useEmbed)) {
      if (group.embeds.length > maxEmbeds) {
        pushGroup()
      }
      group.embeds.push(toLoggableEmbed(item, logLevel, callerData, isPlainString))
    }
    else {
      if (group.embeds.length > 0) {
        pushGroup()
      }
      group.content.push(toLoggableString(item))
    }
  }

  pushGroup()

  // Merge content strings to a single item. Remove either if they have no items.
  return groups.map(group => omitEmpty(group)).map(group => {
    if (group.content) group.content = group.content.join(' ')
    return group
  })
}

/**
 * Sets default values for a single MessageEmbed.
 */
const setLogEmbedDefaults = (logLevel, embed) => {
  if (embed.color != null) {
    return embed
  }
  embed.setColor(logLevel.color)
  return embed
}

/**
 * Sets default values for any MessageEmbeds the user wants to log to Discord.
 */
const setLogSegmentDefaults = (logLevel, message) => {
  if (!message.embeds?.length) return message
  message.embeds = message.embeds.map(embed => setLogEmbedDefaults(logLevel, embed))
  return message
}

/**
 * Generates a logging factory for Discord.
 * 
 * Once generated, the factory can then be called with a log level object to produce a logger.
 */
const logLevelFactory = (callerManifest, logChannel, logErrorChannel) => logLevel => (logSegments, {logRawSegments, logPlainText, isRaw, options}) => {
  const targetChannel = logLevel.isError ? logErrorChannel : logChannel
  if (isRaw) {
    // A raw message is not processed in any way, except we do enforce a default color to any embed objects.
    // Other than this, nothing is done to the message and it's passed on directly.
    for (const logSegment of logSegments) {
      targetChannel.send(setLogSegmentDefaults(logLevel, logSegment))
    }
  }
  else {
    // Otherwise, generate message groups based on how much we need to log, then do them one by one.
    const messageGroups = makeMessageGroups(logSegments, logLevel, callerManifest)
    for (const group of messageGroups) {
      targetChannel.send(group)
    }
  }
}

module.exports = {
  createLogFunctions,
  logLevels
}
