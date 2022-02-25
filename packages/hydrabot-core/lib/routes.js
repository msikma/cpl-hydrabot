// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {Routes} = require('discord-api-types/v9')

async function setupRoutes() {
  try {
    const routes = Object.values(this.commands)
      .map(command => command.manifest)
      .filter(command => command.interactions.length > 0)
    await this.rest.put(Routes.applicationGuildCommands(this.secrets.cid, this.secrets.guildid), {body: routes})
  }
  catch (error) {
    // TODO: use logger?

    console.log('c')
    console.error(error)
  }
}

module.exports = {
  setupRoutes
}
