// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {HydraBot} = require('./index')

/**
 * Initializes HydraBot from the command line.
 * 
 * This passes on the passed arguments and marks the bot as running from the command line.
 */
const initFromCli = async args => {
  const hb = new HydraBot({...args, onCommandLine: true})
  await hb.init()
}

module.exports = {
  initFromCli
}
