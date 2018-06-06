var icy = require('icy')
var EventEmitter = require('events')
var devnull = require('dev-null')
var musicbrainz = require('./musicbrainz')

module.exports = {
  'local': new EventEmitter(),
  'all': new EventEmitter()
}

var PIPES = {}
const URLS = {
  'local': 'http://wyms.streamguys1.com/414music_aac',
  'all': 'https://wyms.streamguys1.com/live'
}

function decodeHTMLEntities (text) {
  var entities = [
    ['amp', '&'],
    ['apos', '\''],
    ['#x27', '\''],
    ['#x2F', '/'],
    ['#39', '\''],
    ['#47', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"']
  ]

  for (var i = 0, max = entities.length; i < max; ++i) {
    text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1])
  }

  return text
}

function parseMetadata (metadata) {
  var regex = /StreamTitle='(.+?) - (.+?)';/
  var matches = metadata.match(regex)
  if (matches) {
    return {
      artist: decodeHTMLEntities(matches[1]),
      track: decodeHTMLEntities(matches[2])
    }
  } else {
    return null
  }
}

Object.keys(module.exports).forEach((key) => {
  module.exports[key].on('newListener', (event) => {
    if (event !== 'song') return
    if (module.exports[key].listenerCount('song') == 0) {
      icy.get(URLS[key], (res) => {
        res.on('metadata', (metadata) => {
          metadata = parseMetadata(metadata.toString())
          if (metadata != null && metadata.artist != '414 Music') {
            musicbrainz.artist(metadata.artist).then((artistObj) => {
              return musicbrainz.track(metadata.track, artistObj).then((track) => {
                module.exports[key].emit('song', {
                  'artist': artistObj.name,
                  'track': track.title,
                  'album': track.releases[0].title,
                  'playedAt': new Date()
                })
              })
            }).catch((e) => {
              module.exports[key].emit('song', {
                'artist': metadata.artist,
                'track': metadata.track,
                'album': null,
                'playedAt': new Date()
              })
            })
          }
        })
        res.pipe(devnull())
        PIPES[key] = res
      })
    }
  })
  module.exports[key].on('removeListener', () => {
    if (module.exports.listenerCount('song') == 1) {
      if (PIPES[key]) {
        PIPES[key].unpipe(devnull())
        PIPES[key] = null
      }
    }
  })
})
