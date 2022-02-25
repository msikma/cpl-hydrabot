// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const path = require('path')
const lockfile = require('proper-lockfile')

const lockDefaults = {
  stale: 10000,
  update: 2000
}

/**
 * Locks a given directory and returns a release function.
 * 
 * This is used to ensure that only one process is currently working with a given directory,
 * and can be used to ensure that a program is only running one instance.
 * 
 * If a given directory is already locked, this will throw an ELOCKED error.
 */
const lockDirectory = async (dirpath, userOpts = {}) => {
  const pathResolved = path.resolve(dirpath)
  const opts = {...lockDefaults, lockfilePath: `${pathResolved}/__dir.lock`, ...userOpts}
  return lockfile.lock(dirpath, opts)
}

module.exports = {
  lockDirectory
}
