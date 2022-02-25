// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

const pingCommand = async interaction => {
  const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions([
          {
            label: 'Select me',
            description: 'This is a description',
            value: 'first_option',
          },
          {
            label: 'You can select me too',
            description: 'This is also a description',
            value: 'second_option',
          },
        ]),
    )
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setDescription('Some description here')

  await interaction.reply({content: 'Pong!', ephemeral: false, embeds: [embed], components: [row]})
}

const respondToSelect = async interaction => {
  console.log('interaction select', interaction.values.join(''))
  await interaction.reply({content: `selected! ${interaction.values.join('')}`, ephemeral: false})
}

const command = {
  manifest: {
    name: 'ping',
    description: 'Replies with pong, but this time in a command',
    interactions: [
      {
        filter: i => i.commandName === 'ping',
        callback: pingCommand
      },
      {
        filter: i => i.isSelectMenu(),
        callback: respondToSelect
      }
    ],
  }
}

module.exports = command
