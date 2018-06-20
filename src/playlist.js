const xml2js = require('xml2js')
const fetch = require('node-fetch')

const PLAYLIST_URL = 'https://s3.amazonaws.com/radiomilwaukee-playlist/WYMSHIS.XML'

/**
 * @param {int} time Duration of delay
 * @return {Promise} A promise that returns after a fixed amount of time.
 */
const delay = (time) => (
  new Promise((resolve) => setTimeout(resolve, time))
)

/**
 * Check for a non-200 class status code and throw an error if it's detected.
 * @param {Object} response Fetch response to check
 * @return {Object} The unchanged response
 */
const checkStatus = (res) => {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    const error = new Error(`Got error ${res.status} (${res.statusText}) when fetching playlist.`)
    error.response = res
    throw error
  }
}

const fetchPlaylistXml = (retryTime = 1000) => (
  fetch(PLAYLIST_URL).then(
    checkStatus
  ).catch((error) => {
    let {response} = error
    if (retryTime > 60000 ||
       (response != null && (response.status === 404 || response.status === 403))) {
      // rethrow if we've retried too many times, or if we get a 404.
      // AWS S3 turns 404s into 403s, so don't retry that either.
      throw error
    }
    return delay(retryTime).then(
      // grow the delay between retries linearly
      fetchPlaylistXml.bind(this, retryTime + 1000)
    )
  })
)

let fetchPlaylistXmlAsText = () => (
  fetchPlaylistXml().then(res => res.text())
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
module.exports.fetch = () => (
  fetchPlaylistXmlAsText().then(parsePlaylist).then(cleanPlaylist)
)
