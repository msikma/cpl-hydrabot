// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const path = require('path')
const Discord = require('discord.js')
const {extractErrorFields} = require('./error')
const {wrapInJSCode} = require('./formatting')
const {limitString, limitStringParagraph} = require('./text')
const {slugifyUnderscore} = require('./slug')
const {inspectObject} = require('./inspect')

/**
 * Creates a Discord MessageEmbed object.
 */
const createMessageEmbed = (logData, logLevel, callerData, fromPlainString = false) => {
  const embed = new Discord.MessageEmbed()

  // If we're creating an embed for a plain string, all we need to do is wrap it in a description.
  if (fromPlainString) {
    embed.setDescription(embedDescription(logData.toString()))
    return embed
  }

  if (logData.title) {
    embed.setTitle(embedTitle(logData.title))
  }
  if (logData.description) {
    embed.setDescription(embedDescription(logData.description))
  }
  if (logData.debug && isPlainObject(logData.debug)) {
    // Print a whole debugging object.
    embed.addField('Debug information', wrapInJSCode(embedField(inspectObject(logData.debug, {colorize: false}))), false)
  }
  if (logData.error) {
    // Unpack the error and log whatever relevant information we get.
    const fields = extractErrorFields(logData.error)
    Object.values(fields).forEach(field => embed.addField(field[0], embedField(field[1]), field[2]))
  }
  if (logData.details && isPlainObject(logData.details)) {
    for (const [key, value] of Object.entries(logData.details)) {
      // Values shorter than a certain threshold will be displayed inline.
      const isShort = value.length < 30
      embed.addField(`\`${key}\``, embedField(value), isShort)
    }
  }

  if (callerData?.data?.meta) {
    embed.setAuthor(callerData.data.meta.name, callerData.data.meta.icon)
  }
  if (logLevel) {
    embed.setColor(logLevel.color)
  }
  embed.setTimestamp()

  return embed
}

/**
 * Checks whether an object is small enough to log entirely as a series of MessageEmbed fields.
 * 
 * There can be up to 25 fields
 * A field's name is limited to 256 characters and its value to 1024 characters
 */
const isSmallObject = (obj, depth = 0, maxFields = 25) => {
  // recursive, allow arrays 
}

/**
 * Creates a Discord MessageEmbed object for debugging.
 */
const createErrorEmbed = (error, title = 'An error has occurred', description = null) => {
  return createMessageEmbed({title, description, error})
}

/**
 * Attaches a remote image to a MessageEmbed and sets it as image.
 */
const attachRemoteImage = (embed, url, filename, forcedExtension, fallbackExtension = 'jpg') => {
  let imageName = filename
  if (!filename) {
    const file = path.parse(new URL(url).pathname)
    const imgExtension = forcedExtension ? forcedExtension : (file.ext ? file.ext.slice(1) : fallbackExtension)
    imageName = `image_${slugifyUnderscore(basename)}.${imgExtension}`
  }
  const attachment = new Discord.MessageAttachment(url, imageName)
  embed.attachFile(attachment)
  embed.setImage(`attachment://${imageName}`)
  return embed
}

/** Limits title and description so they fit in a RichEmbed. */
const embedTitle = limitString(250) // Really 256, but with some buffer built in.
const embedDescription = limitStringParagraph(2000) // Really 2048.
const embedField = limitStringParagraph(1000) // Really 1024.

module.exports = {
  createMessageEmbed,
  createErrorEmbed,
  attachRemoteImage,
  embedTitle,
  embedDescription,
  embedField
}
