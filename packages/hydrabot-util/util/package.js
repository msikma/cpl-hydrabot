// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises
const path = require('path')

/**
 * Returns whether a directory is a valid Node package.
 */
const isPackage = commandsDir => async item => {
  const pkg = path.join(commandsDir, item, 'package.json')
  const stat = await fs.stat(pkg)
  return stat.isFile()
}

/**
 * Imports and returns a package.
 */
const getPackage = commandsDir => async item => {
  const index = path.join(commandsDir, item, 'index.js')
  const pkg = path.join(commandsDir, item, 'package.json')
  const content = require(index)
  const packageData = JSON.parse(await fs.readFile(pkg, 'utf8'))
  return {...content, packageData}
}

module.exports = {
  isPackage,
  getPackage
}
