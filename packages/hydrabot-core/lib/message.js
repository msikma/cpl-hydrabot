// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

function isClientMessage(message) {
  return message.author.id === this.client.user.id
}

module.exports = {
  isClientMessage
}
