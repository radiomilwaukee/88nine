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
  // HACK: we cannot trust anything but the most recent song in the playlist
  // (see the "Incorrect Songs" section in README.md). If / when this is fixed,
  // removing the following line will enable handing the full history that's
  // avaliable in WYMSHIS.XML and all 100 entries will be written out, in order,
  // when a new stream is created.
  playlist = [playlist[0]]

  // as far as I can tell, the "Date" element is always just a less accurate
  // copy of "AIRTIME", and both "Composer" & "MusicId" are always blank. "Cart"
  // is omitted because it's not useful.
  return playlist.map((song) => ({
    album: song.Album[0],
    artist: song.Artist[0],
    duration: parseInt(song.Duration[0]),
    playedAt: new Date(song.AIRTIME[0]),
    title: song.Title[0]
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
