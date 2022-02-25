// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const chalk = require('chalk')
const emphasize = require('emphasize')
const {log, addQuotes} = require('hydrabot-util')

/**
 * Creates a logger for queries being run on the database.
 * 
 * This logs queries to the standard output (not to Discord) with syntax highlighting.
 */
const makeQueryLogger = () => {
  const highlight = query => emphasize.highlight('sql', query).value
  return {
    logQuery: query => {
      const hl = highlight(query)
      const lines = addQuotes(hl)
      log.localQuery(lines)
    }
  }
}

module.exports = {
  makeQueryLogger
}
