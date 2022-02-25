// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const Discord = require('discord.js')
const {bulletizeList} = require('hydrabot-util')
const {log} = require('hydrabot-util')

const add = (...ints) => ints.reduce((total, int) => total + int, 0)

const StatusMessage = hydraBot => async function() {
  const name = 'status'
  const namespace = 'hydrabot_status'

  const nF = new Intl.NumberFormat(hydraBot.options.systemLocale)

  let statusChannel = hydraBot.state.statusChannel
  let statusRow = await hydraBot.db.getMessageGroupByName(name, namespace)
  let statusMessage = statusRow ? await statusChannel.messages.fetch(statusRow.remoteIDs[0]) : null
  let updateTime = 4000
  let updateInterval = null
  let updateOngoing = false

  const getPlayerList = () => {
    const testPlayers = {
      t: (Math.random() * 120 << 0) + 15,
      z: (Math.random() * 120 << 0) + 15,
      p: (Math.random() * 120 << 0) + 15
    }
    const allPlayers = add(...Object.values(testPlayers))
    return [
      `Total: ${nF.format(allPlayers)}`,
      ...Object.entries(testPlayers).map(([race, amount]) => `${hydraBot.Emoji(`race_${race}`)} ${nF.format(amount)}`)
    ]
  }

  const getRankList = () => {
    const testRanks = {
      s: (Math.random() * 5 << 0) + 5,
      a: (Math.random() * 10 << 0) + 5,
      b: (Math.random() * 20 << 0) + 10,
      c: (Math.random() * 30 << 0) + 10,
      d: (Math.random() * 40 << 0) + 10,
      e: (Math.random() * 50 << 0) + 15,
      f: (Math.random() * 60 << 0) + 15,
      u: (Math.random() * 200 << 0) + 25,
      unknown: (Math.random() * 200 << 0) + 25
    }
    return Object.entries(testRanks).map(([rank, amount]) => `${hydraBot.Emoji(`rank_${rank}`)} ${nF.format(amount)}`)
  }

  const getTierList = () => {
    const testTiers = {
      t0: (Math.random() * 5 << 0) + 5,
      t1: (Math.random() * 10 << 0) + 5,
      t2: (Math.random() * 20 << 0) + 10,
      t3: (Math.random() * 30 << 0) + 10
    }
    return Object.entries(testTiers).map(([tier, amount]) => `Tier ${tier.slice(1)}: ${nF.format(amount)}`)
  }

  const getWeeklyMatches = () => {
    return [`Still left to be played: 12`, `Finished: 15`]
  }
  
  const makeStatusEmbed = () => {
    const embed = new Discord.MessageEmbed()
    embed.setTitle('Status info (todo)')
    embed.setDescription(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pulvinar felis eget mauris congue, non imperdiet sapien consequat. Integer euismod urna dui, ac hendrerit nulla mattis at. Praesent feugiat magna ut ligula lacinia, sit amet maximus lacus ultricies. Praesent vel hendrerit mi. In quis turpis orci. Integer id elementum elit, vitae interdum sem. Fusce sit amet tempor neque.`)
    embed.addField('Active players', bulletizeList(getPlayerList()), true)
    embed.addField('Ranks', bulletizeList(getRankList()), true)
    embed.addField('Tiers', bulletizeList(getTierList()), true)
    embed.addField('Weekly match status', bulletizeList(getWeeklyMatches()), true)
    embed.setTimestamp()
    return embed
  }
  

  const setRemoteIDs = async (remoteIDs = []) => {
    statusRow = await hydraBot.db.setMessageGroup(statusRow?.id, name, namespace, remoteIDs)
  }

  const setContents = async (embeds) => {
    if (updateOngoing) return
    updateOngoing = true

    // If there is no status message yet, create a new message.
    if (statusMessage == null) {
      statusMessage = await statusChannel.send({embeds})
      console.log(statusMessage.id)
      await setRemoteIDs([statusMessage.id])
    }
    else {
      statusMessage = await statusMessage.edit({embeds})
    }
    updateOngoing = false
  }

  const updateStatus = () => {
    setContents([makeStatusEmbed()])
  }

  const updateIntervalStart = () => {
    log`Started status update interval: ${updateTime} ms`
    updateInterval = setInterval(updateStatus, updateTime)
  }

  const updateIntervalStop = () => {
    log`Stopped status update interval`
    clearInterval(updateInterval)
  }
  
  return {
    construct: updateIntervalStart,
    destroy: updateIntervalStop
  }
}

module.exports = {
  StatusMessage
}
