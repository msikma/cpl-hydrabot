// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const commandExists = require('command-exists').sync
const {ensureDir, logFormat, InternalError} = require('hydrabot-util')

/**
 * Checks whether the user has the prerequisite command line utilities needed to run HydraBot.
 */
async function checkPrerequisites() {
  const deps = ['sqlite3']
  const missing = deps.map(d => [d, commandExists(d)]).filter(d => !d[1])
  if (missing.length) {
    throw new InternalError({
      message: `HydraBot is missing the following command line dependencies: ${missing.map(d => logFormat`{redBright ${d[0]}}`).join(', ')}. Check the readme for information on installing these.`
    })
  }
}

/**
 * Checks whether the user's environment is suitable for running HydraBot.
 * 
 * It's required that the data directory is accessible and writable.
 * This will create directories if they don't exist.
 */
async function checkEnv() {
  // TODO: check that everything is writable.
  // Ensure that all directories exist.
  const dirs = Object.keys(this.env)
    .filter(k => k.startsWith('path'))
    .map(k => this.env[k])
  return ensureDir(dirs)
}

module.exports = {
  checkPrerequisites,
  checkEnv
}
