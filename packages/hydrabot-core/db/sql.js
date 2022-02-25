// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

// TODO: cleanup
const cache = {
  sqlPrepareFn: null
}

const sql = (...args) => cache.sqlPrepareFn ? cache.sqlPrepareFn(...args) : null

const setSQL = fn => cache.sqlPrepareFn = fn

module.exports = {
  sql,
  setSQL
}
