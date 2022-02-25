// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

async function setupProcessSignals() {
  process.on('SIGINT', this.handleShutdown.bind(this))
}

module.exports = {
  setupProcessSignals
}
