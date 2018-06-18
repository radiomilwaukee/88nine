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

    it('has all required attributes', () => {
      return playlist.fetch().then((playlist) => {
        var song = playlist[0]
        assert.deepEqual(song, {
          album: 'Single - On and On',
          artist: 'Curtis Harding',
          duration: 226,
          playedAt: new Date('2017-10-08T14:51:27.000Z'),
          title: 'On and On'
        })
      })
    })
  })
})
