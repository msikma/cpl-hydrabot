// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {isString, isPlainObject, isArray} = require('./types')

/**
 * Converts a replacements object into an array of regular expressions and values.
 */
const getPathReplacements = obj => {
  const filtered = Object.entries(obj).filter(([k, v]) => isString(v) && k.startsWith('path'))
  return filtered.map(([k, v]) => [new RegExp(`<%\s?${k}\s?%>`, 'g'), v])
}

/**
 * Recursively replaces magic values from the configuration file with their proper values.
 * 
 * For example, this replaces <%pathData%> with the actual path to the data directory.
 */
const replaceMagic = (obj, replacements) => {
  if (isArray(obj)) {
    return obj.map(o => replaceMagic(o, replacements))
  }
  if (isPlainObject(obj)) {
    return Object.entries(obj).reduce((nObj, [key, value]) => ({...nObj, [key]: replaceMagic(value, replacements)}), {})
  }
  if (isString(obj)) {
    return replaceMagicStrings(obj, replacements)
  }

  // Anything that isn't a string is returned verbatim.
  return obj
}

/**
 * Replaces a single magic value inside of a string.
 */
const replaceMagicString = (str, replacement) => {
  const [re, value] = replacement
  return str.replace(re, value)
}

/**
 * Handles string replacement for replaceMagic().
 */
const replaceMagicStrings = (str, replacements) => {
  return replacements.reduce((nStr, replacement) => replaceMagicString(nStr, replacement), str)
}

module.exports = {
  getPathReplacements,
  replaceMagic
}
