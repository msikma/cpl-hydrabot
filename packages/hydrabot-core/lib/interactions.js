// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

async function setupInteractions() {
  this.client.on('interactionCreate', async interaction => {
    for (const command of Object.values(this.commands)) {
      for (const interactionCallback of command.manifest.interactions) {
        if (!interactionCallback.filter(interaction)) {
          continue
        }
        await interactionCallback.callback(interaction)
      }
    }
  })
}

module.exports = {
  setupInteractions
}
