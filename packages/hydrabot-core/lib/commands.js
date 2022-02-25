// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const {getPackage, isPackage, asyncFilter, asyncMap, tryCatch, isFunction} = require('hydrabot-util')

/**
 * Finalizes the functions of a command by binding HydraBot.
 */
function processCommand(command, hydraBot) {
  for (const [key, value] of Object.entries(command)) {
    if (!isFunction(value)) {
      continue
    }
    command[key] = value(hydraBot)
  }
  return command
}

/**
 * Returns a list of all valid bot commands.
 */
async function getCommands(commandsDir, hydraBot) {
  const items = await fs.readdir(commandsDir)
  const packageNames = await asyncFilter(items, tryCatch(isPackage(commandsDir), false))
  const packages = await asyncMap(packageNames, tryCatch(getPackage(commandsDir), false))
  return Object.fromEntries(packages.map(command => [command.manifest.name, processCommand(command, hydraBot)]))
}

async function loadCommands() {
  this.commands = await getCommands(this.env.pathCommands, this)
}

module.exports = {
  getCommands,
  loadCommands
}
