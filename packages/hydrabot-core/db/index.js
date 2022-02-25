// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const path = require('path')
const fs = require('fs').promises
const Database = require('better-sqlite3')
const {gzip} = require('node-gzip')
const {getDateForDailyBackup, ensureDir, exec, fileExists, log, InternalError, isTemplateLiteral} = require('hydrabot-util')
const {makeQueryLogger} = require('./util/logger')
const {createSQLTaggedTemplate} = require('./util/template')
const lib = require('./lib')
const {setSQL} = require('./sql')

/**
 * HydraBot database interface.
 * 
 * This uses sqlite internally and is used to read and write all persistent data related to the bot.
 */
function HydraBotDatabase(env, userOptions = {}) {
  // Reference to the better-sqlite3 Database object.
  this.db = null
  // Paths to all directories and files used by the bot.
  this.env = env
  // Options related to how the database behaves.
  this.options = getInitialOptions(userOptions)

  this.createBackup = lib.createBackup
  this.createBackupFile = lib.createBackupFile
  this.getBackupDirectory = lib.getBackupDirectory
  this.getMessageGroup = lib.getMessageGroup
  this.getMessageGroupByID = lib.getMessageGroupByID
  this.getMessageGroupByName = lib.getMessageGroupByName
  this.getMigrations = lib.getMigrations
  this.runMigrations = lib.runMigrations
  this.setMessageGroup = lib.setMessageGroup
  this.setMessageGroupByID = lib.setMessageGroupByID
  this.setMessageGroupByName = lib.setMessageGroupByName
  this.tableExists = lib.tableExists

  /** Returns the initial options object. */
  function getInitialOptions(userOptions) {
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
   * Opens the database; if this is the first time running the bot, it will create a new file.
   * 
   * If a database exists while this is ostensibly the first run, this will throw a HYDRABOT_E_DBINIT error.
   */
  const openDatabase = async () => {
    const {isFirstRun, logger} = this.options
    if (isFirstRun && (await fileExists(this.env.fileDatabase))) {
      throw new InternalError({
        code: 'HYDRABOT_E_DBINIT',
        message: 'Tried to initialize a new database while one already exists. Either move or delete the old database before initializing.'
      })
    }

    this.db = new Database(this.env.fileDatabase, {fileMustExist: !isFirstRun, verbose: logger})

    // Set up the 'sql' tagged template literal.
    setSQL(createSQLTaggedTemplate(this.db.prepare.bind(this.db)))
  }

  /**
   * Initializes the database. This must be called after construction.
   */
  this.init = async function() {
    await openDatabase()
    await this.runMigrations()
  }
}

module.exports = {
  HydraBotDatabase
}
