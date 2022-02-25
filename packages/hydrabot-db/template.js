// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {removeIndent, isTemplateLiteral, zipArrays, InternalError, isWhitespace} = require('hydrabot-util')

/**
 * Creates a tagged template function for preparing SQL statements.
 * 
 * This should be called with the database handler's .prepare() function as argument.
 */
const createSQLTaggedTemplateLiteral = callback => {
  const prepare = (...args) => {
    if (!isTemplateLiteral(args)) {
      throw new InternalError('Must use sql() with tagged template literal')
    }
    if (!callback) {
      throw new InternalError('No callback has been set.')
    }
    // Reduce the template literal back to the original string.
    const input = zipArrays('')(args[0], args.slice(1)).join('')

    // Remove the left indentation to make the SQL string look nicer in the logs.
    return callback(removeIndent(input))
  }
  return prepare
}

module.exports = {
  createSQLTaggedTemplateLiteral
}
