// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/**
 * Checks whether a table exists.
 * 
 * Returns a boolean.
 */
async function tableExists(name) {
  const stmt = db.handle.prepare(`select tbl_name from sqlite_master where type='table' and name=?`)
  const ret = stmt.get(name)
  return ret?.tbl_name === name
}

module.exports = {
  tableExists
}
