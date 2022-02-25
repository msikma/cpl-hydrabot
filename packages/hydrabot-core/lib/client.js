// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {log} = require('hydrabot-util')

/**
 * Logs in to Discord.
 */
function clientLogin() {
  return new Promise(resolve => {
    this.client.on('ready', () => {
      this.state.isReady = true
      return resolve()
    })
    this.client.login(this.secrets.token)
  })
}

module.exports = {
  clientLogin
}
