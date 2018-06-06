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
