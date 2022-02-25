// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const Emoji = hydraBot => function(name) {
  const emoji = hydraBot.getState('emoji')
  const id = emoji[name]
  return {
    name,
    id,
    toString() {
      return `<:${name}:${id}>`
    }
  }
}

module.exports = {
  Emoji
}
