// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const os = require('os')
const fs = require('fs').promises
const path = require('path')
const {ArgumentParser} = require('argparse')

const main = async () => {
  const pkgPath = path.join(__dirname, '..', '..', 'package.json')
  const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
  const cliParser = new ArgumentParser({
    version: pkgData.version,
    addHelp: true,
    addVersion: true,
    description: `${pkgData.description}.`,
    epilog: 'Send questions and comments to @dada78641 on Twitter.'
  })

  cliParser.addArgument(['-q', '--quiet'], { help: `Suppresses logging to stdout (will still log to Discord).`, dest: 'logQuiet', action: 'storeTrue' })
  cliParser.addArgument(['-l', '--log-queries'], { help: `Log database queries to stdout (not to Discord).`, dest: 'logQueries', action: 'storeTrue' })
  cliParser.addArgument(['--data-path'], { help: 'Path to the data directory.', metavar: 'PATH', dest: 'pathData', defaultValue: `${os.homedir()}/.config/hydrabot` })
  cliParser.addArgument(['--initialize'], { help: `Creates a new database file (only if one does not exist).`, dest: 'isFirstRun', action: 'storeTrue' })
  cliParser.addArgument(['--dev'], { help: `Development mode.`, dest: 'devMode', action: 'storeTrue' })
  
  // Parse command line arguments; if something is wrong, the program exits here.
  const args = {...cliParser.parseArgs(), pathPackage: path.resolve(path.dirname(pkgPath)), packageData: pkgData}
  
  // Start the bot.
  // If something goes wrong during initialization, the process will terminate.
  // Otherwise, the bot will continue running until exited using CTRL+C.
  require('hydrabot-core/init').initFromCli(args)
}

main()
