// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {getRepoInfo, getPlatformInfo} = require('repoinf')
const {InternalError} = require('./error')

/**
 * Returns information about the current environment.
 */
const getRuntimeInfo = async pathPackage => {
  if (!pathPackage) throw new InternalError('Path to package not specified')
  const repo = await getRepoInfo(pathPackage)
  const platform = await getPlatformInfo()
  return {
    repo,
    platform
  }
}

module.exports = {
  getRuntimeInfo
}
