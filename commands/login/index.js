// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const Discord = require('discord.js')
const {log, logInfo, bulletizeString, getRelativeTime, getFormattedDate} = require('hydrabot-util')
const {logLevels} = require('hydrabot-core/log')

const makeCmdBullet = cmd => {
	const {name} = cmd.manifest
	const {version} = cmd.packageData
	return bulletizeString(`${name}@${version}`)
}

/**
 * Logs a startup message containing the current runtime information.
 */
const logStartupMessage = hydraBot => async () => {
	hydraBot.setState('startupTime', new Date())
	const embed = new Discord.MessageEmbed()
	embed.setTitle('HydraBot is starting up')
	embed.setDescription(`Logged in as [${hydraBot.client.user.tag}](${hydraBot.env.packageData.homepage}).`)
	embed.addField('Version', hydraBot.env.packageData.version, true)
	embed.addField('Commit', `[${hydraBot.env.envRepo.version}](${hydraBot.env.packageData.homepage})`, true)
	embed.addField('Server', hydraBot.env.envPlatform.hostname, true)
	embed.addField('Last commit', getFormattedDate(hydraBot.env.envRepo.lastCommit), false)
	embed.addField('Commands', Object.values(hydraBot.commands).map(cmd => makeCmdBullet(cmd)).join('\n'), false)
	embed.setFooter('HydraBot v0.1.0', 'https://i.imgur.com/LQrcBiO.png')
	embed.setTimestamp()
	//embed.addField('Time since last run', `todo`)
	log.local`Logged in as {blue ${hydraBot.client.user.tag}}`
	await logInfo.remoteRaw({ embeds: [embed] })
}

const logShutdownMessage = hydraBot => async () => {
	const startupTime = hydraBot.getState('startupTime')
	const embed = new Discord.MessageEmbed()
	embed.setColor(logLevels.logError.color)
	embed.setTitle('HydraBot is shutting down')
	embed.setDescription(`The message queue will be locked and emptied out before exiting. This may take a minute.`)
	embed.addField('Uptime', `${getRelativeTime(startupTime, new Date(), true)}`, true)
	embed.setFooter('HydraBot v0.1.0', 'https://i.imgur.com/r3vaql5.png')
	embed.setTimestamp()
	log.local`SIGINT received. Shutting down the bot...\n`
	await logInfo.remoteRaw({ embeds: [embed] })
	
}

const command = {
	manifest: {
		name: 'login',
		description: 'Shows bot startup and shutdown messages',
		interactions: []
	},
	logStartupMessage,
	logShutdownMessage
}

module.exports = command
