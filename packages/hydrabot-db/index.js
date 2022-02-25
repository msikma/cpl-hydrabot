// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const path = require('path')
const fs = require('fs').promises
const Database = require('better-sqlite3')
const {gzip} = require('node-gzip')
const {getDateForDailyBackup, ensureDir, exec, fileExists, log, InternalError, isTemplateLiteral} = require('hydrabot-util')
const {makeQueryLogger} = require('./logger')
const {createSQLTaggedTemplateLiteral} = require('./template')

/** Placeholder for the SQL tagged template literal. */
let sql

/**
 * HydraBot database interface.
 * 
 * This uses sqlite internally and is used to read and write all persistent data related to the tournament.
 */
class HydraBotDatabase {
  constructor(env, userOptions = {}) {
    this.db = null
    this.env = env
    this.options = this.getOptions(userOptions)
  }

  /**
   * Initializes the database. This must be called after construction.
   */
  async initialize() {
    await this.openDatabase()
    await this.runMigrations()
  }

  /**
   * Opens the database; if this is the first run, it will create a new one.
   * 
   * If a database exists while this is ostensibly the first run, this will throw a HYDRABOT_E_DBINIT error.
   */
  async openDatabase() {
    const {isFirstRun, logger} = this.options
    if (isFirstRun && (await fileExists(this.env.fileDatabase))) {
      throw new InternalError({
        code: 'HYDRABOT_E_DBINIT',
        message: 'Tried to initialize a new database while one already exists. Either move or delete the old database before initializing.'
      })
    }

    this.db = new Database(this.env.fileDatabase, {fileMustExist: !isFirstRun, verbose: logger})

    // Set up the 'sql' tagged template literal.
    sql = createSQLTaggedTemplateLiteral(this.db.prepare.bind(this.db))
  }

  /**
   * Returns the options with which the database was initialized.
   */
  getOptions(userOptions) {
    const options = {
      isFirstRun: false,
      logQueries: false,
      ...userOptions
    }
    return {
      ...options,
      logger: options.logQueries ? makeQueryLogger().logQuery : null
    }
  }

  /**
   * Checks whether a table exists.
   * 
   * Returns a boolean.
   */
  tableExists(name) {
    const stmt = db.handle.prepare(`select tbl_name from sqlite_master where type='table' and name=?`)
    const ret = stmt.get(name)
    return ret?.tbl_name === name
  }

  /**
   * Returns an array of migrations to perform.
   * 
   * Note: migrations are currently not implemented. This only returns the initial SQL if 'isFirstRun' is true.
   */
  async getMigrations() {
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
  async runMigrations() {
    const migrations = await this.getMigrations()
    if (!migrations.length) return

    log`Running {yellow ${migrations.length}} migration${migrations.length !== 1 ? 's' : ''}:`
    for (const sql of migrations) {
      this.db.exec(sql)
    }
  }

  /**
   * Returns the path for making a backup.
   */
  async getBackupDirectory(type = 'daily') {
    const base = type === 'daily' ? getDateForDailyBackup() : null
    if (!base) throw new Error('Invalid backup type')
    const bdir = path.join(this.env.pathBackups, base)
    await ensureDir(bdir)
    return bdir
  }

  /**
   * Creates a backup of the database and handles errors.
   */
  async createBackup() {
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

  getMessageGroupByID(id) {
    return this.getMessageGroup(id)
  }

  getMessageGroupByName(name) {
    return this.getMessageGroup(null, name)
  }

  async getMessageGroup(id, name) {
    const col = id ? 'id' : 'name'
    const value = id ? id : name
    const stmt = sql`
      select msg_component.remote_id, msg.id, msg.name from msg
      left join msg_component on msg_component.msg_id = msg.id
      where msg.${col} = ?;
    `
    const res = stmt.all(value)
    if (!res.length) {
      return null
    }
    return {
      groupID: res[0].id,
      groupName: res[0].name,
      remoteIDs: res.map(row => row.remote_id)
    }
  }

  /**
   * Creates a backup of the database and saves it to the next backup location.
   */
  async createBackupFile() {
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
}

module.exports = {
  HydraBotDatabase
}
