// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const {getPathReplacements, replaceMagic} = require('hydrabot-util')

/**
 * Loads a config file from a path and replaces magic values with environment data.
 */
const getConfig = async (fileConfig, envObj) => {
  const replacements = getPathReplacements(envObj)
  const data = JSON.parse(await fs.readFile(fileConfig, 'utf8'))
  return replaceMagic(data, replacements)
}

async function loadConfig() {
  this.config = await getConfig(`${this.env.pathData}/config.json`, this.env)
}

module.exports = {
  loadConfig
}
