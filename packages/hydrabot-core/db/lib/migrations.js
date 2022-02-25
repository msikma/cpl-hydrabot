// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const path = require('path')
const {log} = require('hydrabot-util')

/**
 * Returns an array of migrations to perform.
 * 
 * Note: migrations are currently not implemented. This only returns the initial SQL if 'isFirstRun' is true.
 */
async function getMigrations() {
  // TODO
  if (!this.options.isFirstRun) {
    return []
  }
  const sql = await fs.readFile(path.join(this.env.pathMigrations, 'initial.sql'), 'utf8')
  const sql2 = await fs.readFile(path.join(this.env.pathMigrations, 'testing.sql'), 'utf8')
  return [sql, sql2]
}

/**
 * Runs migrations to bring the database file to the latest definition.
 */
async function runMigrations() {
  const migrations = await this.getMigrations()
  if (!migrations.length) return

  log`Running {yellow ${migrations.length}} migration${migrations.length !== 1 ? 's' : ''}:`
  for (const sql of migrations) {
    this.db.exec(sql)
  }
}

module.exports = {
  getMigrations,
  runMigrations
}
