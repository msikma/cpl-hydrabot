// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const path = require('path')
const process = require('process')
const Discord = require('discord.js')
const {REST} = require('@discordjs/rest')
const {ensureDir, log, logInfo, logWarn, logError, die, sleep, logFormat, InternalError, getRuntimeInfo} = require('hydrabot-util')
const objects = require('./objects')
const lib = require('./lib')
const {getAllEmoji} = require('./util')

function HydraBot(args) {
  // Paths to all directories and files used by the bot.
  this.env = null
  // Current state; e.g. whether it's currently shutting down or not.
  this.state = getInitialState(args)
  // Options related to how the bot behaves.
  this.options = getInitialOptions(args)
  // User settings defined in the config file.
  this.config = null
  // Arguments passed on to the constructor.
  this.args = args

  // Database interface.
  this.db = null

  // Contents of the secrets file (used to connect to Discord).
  this.secrets = null

  // Internal objects used to communicate with Discord.
  this.commands = null
  this.client = null
  this.rest = null

  this.checkEnv = lib.checkEnv
  this.checkPrerequisites = lib.checkPrerequisites
  this.clientLogin = lib.clientLogin
  this.isClientMessage = lib.isClientMessage
  this.loadCommands = lib.loadCommands
  this.loadConfig = lib.loadConfig
  this.loadSecrets = lib.loadSecrets
  this.openDatabase = lib.openDatabase
  this.setupErrorHandlers = lib.setupErrorHandlers
  this.setupInteractions = lib.setupInteractions
  this.setupLogger = lib.setupLogger
  this.setupProcessSignals = lib.setupProcessSignals
  this.setupRoutes = lib.setupRoutes

  // Bind all other objects to the instance, such that hydraBot.Message etc. are available.
  for (const [name, obj] of Object.entries(objects)) {
    this[name] = obj(this)
  }

  /**
   * Used to kickstart the bot after construction.
   * 
   * This runs a number of checks to ensure that the bot is capable of starting up.
   * If it's not, an error will be thrown, which will cause the bot to exit if running on the command line.
   */
  const startHydraBot = async () => {
    this.env = await getEnv(this.args)

    log`{blue HydraBot ${this.env.packageData.version}}`
    log`Press CTRL+C to exit.\n`

    await this.checkPrerequisites()
    await this.checkEnv()
    await this.loadConfig()
    await this.loadCommands()
    await this.loadSecrets()
    await this.openDatabase()
    await setupDiscordAPI()
    await this.setupRoutes()
    await this.setupInteractions()
    await this.setupErrorHandlers()
    await this.setupProcessSignals()
    await this.clientLogin()
    await setupDiscordChannels()
    await this.setupLogger()
    await this.commands.login.logStartupMessage()
    await setupDiscordUser()
    await setupDiscordEmoji()
    await setupDiscordIntervals()

    this.client.on('messageCreate', message => {
      if (this.isClientMessage(message)) return
      /*
      Message {
        channelId: '918541349450575972',
        guildId: '910853912834232340',
        deleted: false,
        id: '922272155327143996',
        createdTimestamp: 1639957216818,
        type: 'DEFAULT',
        system: false,
        content: '<:worker_z:922267303322722405>  zxcv',
        author: User {
          id: '105697010165747712',
          bot: false,
          system: false,
          flags: UserFlags { bitfield: 0 },
          username: 'dada78641',
          discriminator: '0789',
          avatar: '568dc76ccb12b3deda29916bf1f86601',
          banner: undefined,
          accentColor: undefined
        },
        pinned: false,
        tts: false,
        nonce: '922272154777550848',
        embeds: [],
        components: [],
        attachments: Collection(0) [Map] {},
        stickers: Collection(0) [Map] {},
        editedTimestamp: null,
        reactions: ReactionManager { message: [Circular *1] },
        mentions: MessageMentions {
          everyone: false,
          users: Collection(0) [Map] {},
          roles: Collection(0) [Map] {},
          _members: null,
          _channels: null,
          crosspostedChannels: Collection(0) [Map] {},
          repliedUser: null
        },
        webhookId: null,
        groupActivityApplication: null,
        applicationId: null,
        activity: null,
        flags: MessageFlags { bitfield: 0 },
        reference: null,
        interaction: null
      } */
      console.log('m', message)
    })

    // temp
    //const b = await this.db.createBackup()
    //console.log(b)  // ['/path/backup.sql.gz', { stat info }]
  }

  /** Sets a state variable. */
  this.setState = function(key, value) {
    this.state[key] = value
  }

  /** Gets a state variable. */
  this.getState = function(key) {
    return this.state[key]
  }

  /** Returns the initial state object. */
  function getInitialState(args) {
    return {
      isReady: false,
      isShuttingDown: false,
      inDevMode: args.devMode,
      logChannel: null,
      logErrorChannel: null,
      onCommandLine: args.onCommandLine,
      guild: null,
      startupTime: null,
      hasRequestedShutdowns: 0
    }
  }

  /** Sets an option. */
  this.setOption = function(key, value) {
    this.options[key] = value
  }

  /** Gets an option. */
  this.getOption = function(key) {
    return this.options[key]
  }

  /** Returns the initial options object. */
  function getInitialOptions(args) {
    const {logQuiet, logQueries, isFirstRun} = args
    return {
      logQuiet,
      logQueries,
      isFirstRun,
      systemLocale: 'en-US'
    }
  }

  /**
   * Returns an object of all paths to relevant external files and directories and other static runtime information.
   * 
   * Environment options cannot be changed after initialization.
   */
  async function getEnv(args) {
    // List of all paths that are relevant to the bot.
    const {pathPackage, pathData, packageData} = args
    const pathCommands = path.join(pathPackage, 'commands')
    const pathMigrations = path.join(pathPackage, 'migrations')
    const pathReplays = path.join(pathData, 'files', 'replays')
    const pathBackups = path.join(pathData, 'backups')

    const fileDatabase = path.join(pathData, 'hydrabot.db')
    const fileSecrets = path.join(pathData, 'secrets.json')

    // Runtime information about our repo and the platform we're running on.
    const envInfo = await getRuntimeInfo(pathPackage)
    const envRepo = envInfo.repo
    const envPlatform = envInfo.platform

    return {
      pathPackage,
      pathData,
      pathCommands,
      pathMigrations,
      pathBackups,
      pathReplays,
      fileDatabase,
      fileSecrets,
      packageData,
      envRepo,
      envPlatform
    }
  }

  /**
   * Searches for and caches the IDs of all channels we need to interface with.
   * 
   * If, at any point, any of these channels are missing, they will be created.
   * 
   * TODO: channel creation.
   */
  const setupDiscordChannels = async () => {
    this.state.server = await this.client.guilds.fetch(this.config.system.server)
    this.state.logChannel = await this.client.channels.fetch(this.config.system.logChannel)
    this.state.logErrorChannel = await this.client.channels.fetch(this.config.system.logErrorChannel)
    this.state.statusChannel = await this.client.channels.fetch(this.config.system.statusChannel)
  }

  /**
   * Ensures that the bot user is set up correctly, with a valid name and avatar.
   */
  const setupDiscordUser = async () => {
    if (false) await this.client.user.setAvatar(this.config.botUser.avatar)
  }

  /**
   * Initializes and starts objects that update on an interval.
   */
  const setupDiscordIntervals = async () => {
    this.state.systemIntervals = [
      await this.StatusMessage()
    ]

    // Start up the intervals. They will keep running until shutdown.
    for (const obj of this.state.systemIntervals) {
      await obj.construct()
    }
  }

  /**
   * Ensures that all necessary emoji are set up as required.
   */
  const setupDiscordEmoji = async () => {
    // The emoji we need to have available for the bot to function.
    const requiredEmoji = await getAllEmoji(this.env.pathPackage)
    // Lookup table for emoji that are currently remotely available.
    const remoteEmoji = Object.fromEntries(new Array(...this.state.server.emojis.cache).map(([id, value]) => [value.name, id]))

    // Final lookup table for emoji for use by the bot.
    const availableEmoji = {}
    // List of emoji we've added in this cycle.
    const addedEmoji = []

    for (const [name, filepath] of Object.entries(requiredEmoji)) {
      if (remoteEmoji[name]) {
        availableEmoji[name] = remoteEmoji[name]
        continue
      }
      
      try {
        const emoji = await this.state.server.emojis.create(filepath, name)
        availableEmoji[name] = emoji.id
        addedEmoji.push(name)
      }
      catch (err) {
        logError.errorObject(err, 'Error while adding emoji')
        throw err
      }
    }

    if (addedEmoji.length) {
      logInfo`Added the following emoji: ${addedEmoji.join(', ')}`
    }
    
    this.setState('emoji', availableEmoji)
  }

  /**
   * Creates Client and REST objects using the necessary intents.
   */
  const setupDiscordAPI = async () => {
    this.client = new Discord.Client({intents: [
      Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Discord.Intents.FLAGS.GUILD_MESSAGES,
      Discord.Intents.FLAGS.GUILDS,
      Discord.Intents.FLAGS.DIRECT_MESSAGES,
      Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]})
    this.rest = new REST({version: '9'}).setToken(this.secrets.token)
  }

  /**
   * Called when the shutdown handler is initiated.
   * 
   * TODO: handle this when we're not on command line.
   */
  this.handleShutdown = async function() {
    if (this.state.onCommandLine) {
      // Print a single newline to skip over the ^C.
      process.stdout.write('\n')
    }
    // If the user has pressed CTRL+C multiple times, do a quick shutdown.
    if (this.state.hasRequestedShutdowns++ > 1) {
      // TODO
      console.log('todo quick shutdown')
    }
    try {
      this.state.isShuttingDown = true
      await this.commands.login.logShutdownMessage()
      for (const obj of this.state.systemIntervals) {
        await obj.destroy()
      }
      await sleep(2000)
      await this.client.destroy()
      
      await sleep(2000)
      // TODO: wait for all messages to be flushed.
      console.log('todo, do stuff here')
      process.exit(0)
    }
    catch (err) {
      console.log('an error occurred while shutting down')
      console.log(err)
      process.exit(0)
    }
  }

  /**
   * Used to kickstart the bot after construction.
   * 
   * This really just does some setup and then runs startHydraBot() wrapped in a try/catch block.
   * 
   * When running from the command line, 'state.onCommandLine' will be true; this will cause the process
   * to exit if a fatal error occurs during initialization. When not running from the command line,
   * errors are thrown and don't cause an exit, and logging is suppressed by default.
   */
  this.init = async function() {
    // Don't log if logQuiet is true; don't log unless it's explicitly allowed if not on the command line.
    if (this.options.logQuiet === true || (!this.state.onCommandLine && this.options.logQuiet !== false)) {
      log.deactivate()
    }
    try {
      await startHydraBot()
    }
    catch (err) {
      // Pass on the error if we're not exiting.
      if (!this.state.onCommandLine) throw err

      die(err)
    }
  }
}

module.exports = {
  HydraBot
}
