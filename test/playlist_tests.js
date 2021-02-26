var assert = require('assert')
var rewire = require('rewire')
const {describe, it} = require('mocha')

var playlist = rewire('../src/playlist')

describe('Playlist', () => {
  describe('#fetch()', () => {
    it('works with normal playlist', () => {
      playlist.__set__('fetchPlaylist', function () {
        var fs = require('fs')
        return new Promise((resolve, reject) => {
          resolve(JSON.parse(fs.readFileSync('./test/data/playlist.json')))
        })
      })

      return playlist.fetch().then((playlist) => {
        var song = playlist[0]
        assert.deepEqual(song, {
          album: 'Good Days - Single',
          artist: 'SZA',
          duration: 4 * 60 + 24,
          playedAt: new Date('2021-02-26T18:42:20.000Z'),
          title: 'Good Days'
        })
      })
    })

    it('works with playlist that has image', () => {
      playlist.__set__('fetchPlaylist', function () {
        var fs = require('fs')
        return new Promise((resolve, reject) => {
          resolve(JSON.parse(fs.readFileSync('./test/data/playlist-with-image.json')))
        })
      })

      return playlist.fetch().then((playlist) => {
        var song = playlist[0]
        assert.deepEqual(song, {
          album: 'Caravelle',
          artist: 'Polo & Pan',
          duration: 4 * 60 + 33,
          playedAt: new Date('2021-02-26T18:46:37.000Z'),
          title: 'Canopée'
        })
      })
    })

    it('works with empty playlist', () => {
      playlist.__set__('fetchPlaylist', function () {
        var fs = require('fs')
        return new Promise((resolve, reject) => {
          resolve(JSON.parse(fs.readFileSync('./test/data/playlist-empty.json')))
        })
      })

      return playlist.fetch().then((playlist) => {
        assert.deepEqual(playlist, [])
      })
    })
  })
})
