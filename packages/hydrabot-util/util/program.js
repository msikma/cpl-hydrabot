// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

/** Exits the program with a given exit code. */
const progKill = (exitCode = 0) => {
  process.exit(exitCode)
}

module.exports = {
  progKill
}
