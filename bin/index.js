#!/usr/bin/env node
const packageInfo = require('../package')
const {ArgumentParser} = require('argparse')
const JSONStream = require('JSONStream')
const PlaylistStream = require('../src/playlist-stream')

const argparser = new ArgumentParser({
  version: packageInfo.version,
  addHelp: true,
  description: packageInfo.description
})

argparser.addArgument(
  ['-n', '--interval'],
  {
    type: 'float',
    help: 'Seconds to wait between updates. Defaults to 60 seconds.',
    defaultValue: 60
  }
)

const argv = argparser.parseArgs()
const {interval} = argv
const stream = new PlaylistStream(interval * 1000)

stream.pipe(
  JSONStream.stringify('', '\n', '')
).pipe(
  process.stdout
)
