const Readable = require('readable-stream')
const sortBy = require('lodash.sortby')
const {fetch} = require('./playlist')

class PlaylistStream extends Readable {
  /**
   * A stream of songs that have been played. This is gaurenteed to contain no
   * duplicates and will be in chronological order.
   * @param {Integer} [minPollingInterval=60000] How often to poll for new
   * songs, in milliseconds. A reasonable value is 60 * 1000, or 60 seconds,
   * since the average length of a song is about 3 minutes. If no read calls are
   * made, then this polling interval may be exceeded, therefore it's
   * technically a minimum.
   */
  constructor (minPollingInterval = 60000) {
    super({objectMode: true})
    this._minPollingInterval = minPollingInterval
    this._mostRecentPlayedAt = null
    this._lastPollTime = null
    this._pollTimeout = null

    // if the stream is destroyed in the middle of _pollForSongs, then we should
    // quit pushing data
    this._isDestroyed = false
  }

  _pollForSongs () {
    fetch().then((songs) => {
      this._pollTimeout = null
      this._lastPollTime = Date.now()

      // make sure the stream hasn't been destroyed while we were waiting. we
      // can't write to a destroyed stream
      if (this._isDestroyed) return

      // filter out all the songs we've seen before, unless this is the first poll
      if (this._mostRecentPlayedAt !== null) {
        songs = songs.filter((song) => (
          song.playedAt > this._mostRecentPlayedAt
        ))
      }

      const totalNewSongs = songs.length
      if (totalNewSongs === 0) {
        // if we don't write anything, then the read function won't be called,
        // so schedule another poll
        this._schedulePoll()
        return
      }

      songs = sortBy(songs, 'playedAt')
      songs.map(
        this.push.bind(this)
      )
      this._mostRecentPlayedAt = songs[totalNewSongs - 1].playedAt
    }).catch((error) =>
      this.destroy(error)
    )
  }

  _schedulePoll (delay = this._minPollingInterval) {
    this._pollTimeout = setTimeout(
      this._pollForSongs.bind(this),
      delay
    )
  }

  _read () {
    if (this._pollTimeout !== null) return
    if (this._lastPollTime === null) {
      this._pollForSongs() // first poll
      return
    }

    // _read won't be called again until we return data, so set a timeout to
    // poll when our minPollingInterval has been reached. if it's already
    // reached, set a timeout for 0.
    let timeSinceLastPoll = Date.now() - this._lastPollTime
    this._schedulePoll(
      Math.max(0, this._minPollingInterval - timeSinceLastPoll)
    )
  }

  _destroy (err, cb) {
    this._isDestroyed = true
    clearTimeout(this._pollTimeout)
    super._destroy(err, cb)
  }
}

module.exports = PlaylistStream
