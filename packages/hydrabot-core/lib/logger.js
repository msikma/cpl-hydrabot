// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {log, logInfo, logWarn, logError} = require('hydrabot-util')
const {createLogFunctions} = require('../log')

async function setupLogger() {
  const manifest = {}
  const discordLogFunctions = createLogFunctions(manifest, this.state.logChannel, this.state.logErrorChannel)
  log.setRemoteLogger(discordLogFunctions.logRegular)
  logInfo.setRemoteLogger(discordLogFunctions.logInfo)
  logWarn.setRemoteLogger(discordLogFunctions.logWarn)
  logError.setRemoteLogger(discordLogFunctions.logError)
}

module.exports = {
  setupLogger
}
