88nine Radio Milwaukee
=======================

A node library for interacting with [88nine Radio Milwaukee](http://radiomilwaukee.org).

```
npm install 88nine
```

## Playlists

**Fetch** - Get a list of the 100 most recently played songs 

```
const playlist = require('88nine').playlist;
playlist.fetch().then(function(songs) {
  // do something with the songs
  // Songs is an array of js objects with 
  // the following structure:

  [{ 
    playedAt: 2017-10-08T16:58:09.000Z,
    artist: 'Abby Jeanne',
    title: 'Cosmic Beings',
    album: 'Cosmic Beings- Single',
    composer: '' 
  }]
});
```

**Last** - Get the last `N` recently plaed songs (defaults to 1)

```
playlist.last().then(function(song) {
  // Song is the most recently played song
});
```

**Song Event** - `playlist` is an `EventEmitter` that emits a `song` event for every new playlist entry

```
playlist.on('song', function(song) {
  // Song is the song that is currently playing
  // (this is checked every 5 seconds)
});
```
