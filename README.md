88nine Radio Milwaukee
=======================

A node library for interacting with [88nine Radio Milwaukee](http://radiomilwaukee.org).

```
npm install 88nine
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

As of right now (2018-06-11), the XML feed at `https://s3.amazonaws.com/radiomilwaukee-playlist/WYMSHIS.XML` that we pull from will return a large number of incorrect songs. These songs are real songs with all the information that you would expect, but they have not actually been played on the radio at the specified times. As far as I can tell, there is no information in the song data that would distinguish these incorrect songs from the correct songs that do get played.

Even the `playedAt` times and `duration` fields of incorrect songs will often match up with realistic schedules. Attempting to filter out incorrect songs by constructing a schedule and fitting songs in based on their reported start and end times will not work. Based on the reported `playedAt` times and `duration` fields, correct songs can overlap by up to 10 seconds and can be separated by gaps of up to several minutes (for advertising blocks). Given these constraints, incorrect songs still fit into the resulting schedule.

The `WYMSHIS.XML` feed is updated regularly and it seems like each time it is updated, the first song in the list is a song that is currently being played or has been played the most recently, followed by 0 or more songs that have not been played. Reading only the first song is the most reliable way of getting correct songs that I have found. Sadly, this means that nothing in the `WYMSHIS.XML` file, past the first song, can be trusted.
