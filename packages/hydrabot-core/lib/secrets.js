// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const fs = require('fs').promises

/**
 * Reads and parses the contents of the secrets file.
 */
async function loadSecrets() {
  this.secrets = JSON.parse(await fs.readFile(this.env.fileSecrets, 'utf8'))
}

module.exports = {
  loadSecrets
}
