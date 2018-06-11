# 88nine Radio Milwaukee

A node library for interacting with [88nine Radio Milwaukee](http://radiomilwaukee.org).

```bash
npm install --save 88nine
```

## How do I use it?

```js
const {PlaylistStream} = require('88nine')

// create a stream that checks for a new song once every 60 seconds (60,000ms)
var stream = new PlaylistStream(60000)

// this function will be called whenever the stream has data to be read. In this
// case, that's whenever a new song is played.
stream.on('data', (song) => {
  // song is something like:
  // {
  //   album: 'Illinois',
  //   artist: 'Sufjan Stevens',
  //   duration: 520, // the duraiton in seconds
  //   playedAt: new Date('2018-06-11T20:22:11.000Z'),
  //   title: 'Casimir Pulaski Day',
  // }
})

// you can destroy it when you're done using the stream, if you want
stream.destroy()
```

## Playlists

**Fetch** - Get a list of the 100 most recently played songs

```javascript
const playlist = require('88nine').playlist;
playlist.fetch().then(function(songs) {
  // do something with the songs
  // Songs is an array of js objects with
  // the following structure:

  [{
    playedAt: "2017-10-08T16:58:09.000Z",
    artist: 'Abby Jeanne',
    title: 'Cosmic Beings',
    album: 'Cosmic Beings- Single',
    composer: ''
  }]
});
```

**Last** - Get the last `N` recently played songs (defaults to 1)

```javascript
playlist.last().then(function(song) {
  // Song is the most recently played song
});
```

## Stream

**Song Event** - `EventEmitter` for pulling metadata from the live streams

```javascript

// Subscribe to events for only local music
const {live} = require('88nine');
live.local.on('song', function(song) {
  {
    artist: 'Andrea Day',
    track: 'Rise Up',
    album: 'Cheers to the Fall',
    playedAt: new Date('2017-10-08T20:02:47.411Z')
  }
});

// Subscribe to events for full 88nine stream
const {live} = require('88nine');
live.all.on('song', function(song) {
  {
    artist: 'Andrea Day',
    track: 'Rise Up',
    album: 'Cheers to the Fall',
    playedAt: new Date('2017-10-08T20:02:47.411Z')
  }
});
```

## Incorrect Songs

We pull data from an XML feed at `https://s3.amazonaws.com/radiomilwaukee-playlist/WYMSHIS.XML` which is supposed to contain the last 100 songs. So, this package is designed with a streaming interface that _would_ write out the full 100 song history as soon as you start the stream, and then gradually write out songs as they are being played & added to the the XML feed.

However, that's not possible because, as of right now (2018-06-11), the XML feed will return a large number of incorrect songs. These songs are real songs with all the information that you would expect, but they have not actually been played on the radio at the specified times. As far as I can tell, there is no information in the song data that can be used to distinguish these incorrect songs from the songs that do get played.

Even the `playedAt` times and `duration` fields of incorrect songs will often match up with a realistic schedule. Attempting to filter out incorrect songs by constructing a schedule and fitting songs in based on their reported start and end times will not work. Based on the reported `playedAt` times and `duration` fields, correct songs can overlap by up to 10 seconds and can be separated by gaps of several minutes (for advertising blocks). Given these constraints, incorrect songs still fit into the resulting schedule.

The `WYMSHIS.XML` feed is updated regularly and it seems like each time it is updated, the first song in the list is the song currently being played, or the last song that was played, followed by 0 or more songs that have not been played. Reading only the first song is the most reliable way of getting correct songs that I have found. Sadly, this means that nothing in the `WYMSHIS.XML` file, past the first song, can be trusted.

Until this is fixed, the stream won't return any history, it will only contain songs that have been played directly before or shortly after the stream was started.
