// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/**
 * Abstraction for messages.
 */
const Message = hydraBot => async function(name, namespace = 'global', id = null) {
  const msg = await hydraBot.db.getMessageGroupByName(name, namespace)
  console.log('msg', msg)
  return {
    exists: msg != null,
    msg
  }
}

module.exports = {
  Message
}
