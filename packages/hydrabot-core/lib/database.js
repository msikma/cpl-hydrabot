// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {HydraBotDatabase} = require('../db')

/**
 * Constructs a new database object and initializes it.
 * 
 * This will throw an error if the database could not be opened for some reason,
 * and also if we're trying to initialize a new database while an old one exists.
 */
async function openDatabase() {
  const db = new HydraBotDatabase(this.env, this.options)
  await db.init()
  this.db = db
}

module.exports = {
  openDatabase
}
