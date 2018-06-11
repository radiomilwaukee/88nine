var assert = require('assert')
var rewire = require('rewire')
const {describe, it} = require('mocha')

var playlist = rewire('../src/playlist')
playlist.__set__('fetchPlaylistXml', function () {
  var fs = require('fs')
  return new Promise((resolve, reject) => {
    resolve(fs.readFileSync('./test/data/playlist.xml').toString())
  })
})

describe('Playlist', () => {
  describe('#fetch()', () => {
    it.skip('is the correct length', () => {
      return playlist.fetch().then((playlist) => {
        assert.equal(100, playlist.length)
      })
    })

    it('has all requied attributes', () => {
      return playlist.fetch().then((playlist) => {
        var song = playlist[0]
        assert('playedAt' in song)

        assert('artist' in song)
        assert(song.artist === 'Curtis Harding')

        assert('title' in song)
        assert(song.title === 'On and On')

        assert('album' in song)
        assert(song.album === 'Single - On and On')
      })
    })
  })
})
