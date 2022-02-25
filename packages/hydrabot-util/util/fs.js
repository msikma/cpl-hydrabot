// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const constants = require('fs')
const {wrapInArray} = require('./data')

/**
 * Ensures that a given list of paths all exist.
 */
const ensureDir = async paths => {
  // Ensure we don't check paths multiple times.
  const dirs = [...new Set(wrapInArray(paths))]
  return Promise.all(dirs.map(dir => fs.mkdir(dir, {recursive: true})))
}

/**
 * Checks whether a certain access level applies to a given file path.
 * 
 * This checks whether a file is readable, writable or visible and returns a boolean.
 */
const fileAccessCheck = async (filepath, access) => {
  try {
    return await fs.access(filepath, access) == null
  }
  catch (err) {
    // If the file does not exist or we don't have permission for a given access level, return false.
    if (err.code === 'ENOENT' || err.code === 'EACCES') {
      return false
    }
    // Otherwise, something unexpected went wrong that the caller should know about.
    throw err
  }
}

/** Checks whether a file or path exists. */
const fileExists = filepath => fileAccessCheck(filepath, constants.F_OK)
/** Checks whether a file or path is writable. */
const fileIsWritable = filepath => fileAccessCheck(filepath, constants.W_OK)
/** Checks whether a file or path is readable. */
const fileIsReadable = filepath => fileAccessCheck(filepath, constants.R_OK)

module.exports = {
  ensureDir,
  fileAccessCheck,
  fileExists,
  fileIsWritable,
  fileIsReadable
}
