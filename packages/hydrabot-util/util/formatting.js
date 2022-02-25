// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {inspectObject} = require('./inspect')

/**
 * Wraps an object in a printable Markdown code block.
 */
const wrapObject = obj => (
  wrapInJSCode(inspectObject(obj, {colorize: false}))
)

/**
 * Wraps a string in Markdown JS code blocks.
 * 
 * Useful for posting the contents of an inspectObject() to Discord.
 */
const wrapInJSCode = str => (
  `\`\`\`js\n${str}\n\`\`\``
)

/**
 * Wraps an error stack.
 */
const wrapStack = stack => (
  `\`\`\`\n${stack}\n\`\`\``
)

/**
 * Wraps a string in a preformatted text block.
 */
const wrapInPre = str => (
  `\`\`\`\n${str}\n\`\`\``
)

/**
 * Wraps a string in a monospace block (without linebreak).
 */
const wrapInMono = str => (
  `\`${str}\``
)

module.exports = {
  wrapObject,
  wrapInJSCode,
  wrapStack,
  wrapInPre,
  wrapInMono
}
