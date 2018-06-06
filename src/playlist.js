const xml2js = require('xml2js')
const http = require('node-fetch')

const PLAYLIST_URL = 'https://s3.amazonaws.com/radiomilwaukee-playlist/WYMSHIS.XML'

let fetchPlaylistXml = () => (
  http(PLAYLIST_URL).then(
    res => res.text()
  )
)

function parsePlaylist (rawXml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(rawXml, (error, json) => {
      if (error) { return reject(error) }
      resolve(json.PlayList.Song)
    })
  })
};

function cleanPlaylist (playlist) {
  return playlist.map((song) => ({
    playedAt: new Date(song.AIRTIME[0]),
    artist: song.Artist[0],
    title: song.Title[0],
    album: song.Album[0],
    composer: song.Composer[0]
  }))
}

/*
 * Fetch the entire playlist history
 */
module.exports.fetch = function () {
  return fetchPlaylistXml(PLAYLIST_URL)
    .then(parsePlaylist)
    .then(cleanPlaylist)
}

/*
 * Fetch the last played song in the playlist,
 * optional count parameter to fetch the last
 * `N` songs.
 */
module.exports.last = function (amount) {
  if (amount === undefined) amount = 1
  return module.exports.fetch().then((list) => {
    if (amount === 1) {
      return list[0]
    } else {
      return list.slice(0, amount)
    }
  })
}
