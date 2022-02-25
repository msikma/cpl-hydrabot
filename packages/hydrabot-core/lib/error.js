// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

async function setupErrorHandlers() {
  const handleClientEvent = (...args) => {
    console.log('a', args)
  }
  process.on('uncaughtException', err => handleClientEvent('Fatal', 'Unhandled exception', err))
  this.client.on('error', err => handleClientEvent('Error', 'Unhandled error', err))
  this.client.on('warn', err => handleClientEvent('Warn', 'Unhandled warning', err))
}

module.exports = {
  setupErrorHandlers
}
