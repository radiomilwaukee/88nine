# 88nine Radio Milwaukee

A node library for interacting with [88nine Radio Milwaukee](http://radiomilwaukee.org).

```bash
npm install --save 88nine
```

## How do I use it?

### As a Node.js Module

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

### As a CLI

88nine also includes a simple CLI, which will be available in your shell as `88nine` if the module was installed using `--global`.

```
$ 88nine --help
usage: 88nine [-h] [-v] [-n INTERVAL]

Library for interacting with 88nine Radio Milwaukee

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -n INTERVAL, --interval INTERVAL
                        Seconds to wait between updates. Defaults to 60
                        seconds.
```

When run, it will print out each song that it finds to STDOUT, as they are played on the radio. This will continue running until you kill it. Songs are formatted as [newline-delimited JSON](http://ndjson.org/).

```
$ 88nine -n 30
{"album":"Little Neon Limelight","artist":"Houndmouth","duration":202,"playedAt":"2018-06-19T18:00:02.000Z","title":"Say It"}
{"album":"The Hanged Man","artist":"Ted Leo","duration":199,"playedAt":"2018-06-19T18:03:26.000Z","title":"Can't Go Back"}
{"album":"Critical Equation","artist":"Dr. Dog","duration":207,"playedAt":"2018-06-19T18:06:45.000Z","title":"Go Out Fighting"}
```
