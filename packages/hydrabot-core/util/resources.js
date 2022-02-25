// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const path = require('path')

/**
 * Loads a list of all emoji we need to have available on the server.
 */
const getAllEmoji = async (pathPackage) => {
  const addBase = fn => path.join(pathPackage, 'resources', 'emoji', fn)
  const file = addBase('data.json')
  const data = JSON.parse(await fs.readFile(file, 'utf8'))
  return Object.fromEntries(data.map(([name, file]) => [name, addBase(file)]))
}

module.exports = {
  getAllEmoji
}
