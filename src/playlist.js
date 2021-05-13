const fetch = require('node-fetch')

const PLAYLIST_URL = 'https://s3.amazonaws.com/radiomilwaukee-playlist/RMDATA'

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

let fetchPlaylist = (retryTime = 1000) => (
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
      fetchPlaylist.bind(this, retryTime + 1000)
    )
  }).then(
    response => response.json()
  )
)

const parseDuration = (duration) => {
  const [hours, minutes, seconds] = duration.split(':').map((x) => parseInt(x))
  return hours * 60 * 60 + minutes * 60 + seconds
}

const cleanPlaylist = (playlist) => {
  // if the playlist is empty, return an empty array
  if (playlist.nowPlaying.length === 0) {
    return []
  }

  // the playlist only gives us the current song
  const song = playlist.nowPlaying[0]

  // clearly bad data, return an empty array
  if (song.title === '' && song.album === '' && song.artist === '') {
    return []
  }

  return [{
    album: song.album,
    artist: song.artist,
    duration: parseDuration(song.duration),
    playedAt: new Date(song.startTime),
    title: song.title
  }]
}

/*
 * Fetch the entire playlist history
 */
module.exports.fetch = () => (
  fetchPlaylist().then(cleanPlaylist)
)
