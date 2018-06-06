var assert = require('assert')
var rewire = require('rewire')

var playlist = rewire('../src/playlist')
playlist.__set__('fetchPlaylistXml', function () {
  var fs = require('fs')
  return new Promise((resolve, reject) => {
    resolve(fs.readFileSync('./test/data/playlist.xml').toString())
  })
})

describe('Playlist', () => {
  describe('#fetch()', () => {
    it('is the correct length', () => {
      return playlist.fetch().then((playlist) => {
        assert.equal(100, playlist.length)
      })
    })

    it('has all requied attributes', () => {
      return playlist.fetch().then((playlist) => {
        var song = playlist[0]
        assert(Object.keys(song).indexOf('playedAt') != -1)

        assert(Object.keys(song).indexOf('artist') != -1)
        assert(song.artist == 'Curtis Harding')

        assert(Object.keys(song).indexOf('title') != -1)
        assert(song.title == 'On and On')

        assert(Object.keys(song).indexOf('album') != -1)
        assert(song.album == 'Single - On and On')
      })
    })
  })

  describe('#last()', () => {
    it('Fetches the last song played', () => {
      return playlist.last().then((song) => {
        assert(song.title == 'On and On')
      })
    })

    it('Fetches the last two songs played', () => {
      return playlist.last(2).then((songs) => {
        assert(songs.length == 2)
        assert(songs[0].title == 'On and On')
        assert(songs[1].title == 'Zonin')
      })
    })
  })
})
