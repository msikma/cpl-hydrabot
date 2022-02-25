// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const path = require('path')
const fs = require('fs').promises
const {gzip} = require('node-gzip')
const {getDateForDailyBackup, ensureDir, exec} = require('hydrabot-util')

/**
 * Returns the path for making a backup.
 */
async function getBackupDirectory(type = 'daily') {
  const base = type === 'daily' ? getDateForDailyBackup() : null
  if (!base) throw new Error('Invalid backup type')
  const bdir = path.join(this.env.pathBackups, base)
  await ensureDir(bdir)
  return bdir
}

/**
 * Creates a backup of the database and handles errors.
 */
async function createBackup() {
  try {
    return this.createBackupFile()
  }
  catch (err) {
    console.log('TODO')
    console.log('createbackup failure', err)
    if (err.code === 'ENOENT') {
      // do something?
      return null
    }
    else {
      return null
    }
  }
}

/**
 * Creates a backup of the database and saves it to the next backup location.
 */
async function createBackupFile() {
  // Run sqlite3 to dump the contents of the database to a string.
  // This will contain the schema as well as the data.
  const res = await exec(['sqlite3', this.env.fileDatabase, '.dump'], 'utf8')
  const bdir = await this.getBackupDirectory()
  const bpath = path.join(bdir, 'hydrabot.sql.gz')

  // Gzip the contents of the dump and write it to the destination file.
  await fs.writeFile(bpath, await gzip(res.stdout), null)
  const stat = await fs.stat(bpath)
  return [bpath, stat]
}

module.exports = {
  createBackup,
  createBackupFile,
  getBackupDirectory
}
