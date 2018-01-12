var icy = require('icy');
var EventEmitter = require('events');
var devnull = require('dev-null');
var musicbrainz = require('./musicbrainz');

module.exports = {
    "local": new EventEmitter(),
    "all": new EventEmitter()
}

var PIPES = {}
const URLS = {
    "local": "http://wyms.streamguys1.com/414music_aac",
    "all": "https://wyms.streamguys1.com/live"
}

function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0, max = entities.length; i < max; ++i)
        text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

    return text;
}


function parseMetadata(metadata) {
    var regex = /StreamTitle\='(.+?) - (.+?)';/;
    var matches = metadata.match(regex);
    if (matches) {
        return {
            artist: decodeHTMLEntities(matches[1]),
            track: decodeHTMLEntities(matches[2])
        }
    } else {
        return null;
    }
}

Object.keys(module.exports).forEach((key) => {
    module.exports[key].on('newListener', (event) => {
        if (event !== 'song') return;
        if (module.exports[key].listenerCount('song') == 0) {
            icy.get(URLS[key], (res) => {
                res.on("metadata", (metadata) => {
                    metadata = parseMetadata(metadata.toString());
                    if (metadata != null && metadata.artist != '414 Music') {
                        getMusicbrainz(metadata).then((obj) => {
                            module.exports[key].emit('song', obj);
                        })
                    }
                });
                res.pipe(devnull());
                PIPES[key] = res;
            })
        }
    })
    module.exports[key].on('removeListener', () => {
        if (module.exports.listenerCount('song') == 1) {
            if (PIPES[key]) {
                PIPES[key].unpipe(devnull());
                PIPES[key] = null;
            }
        }
    });
})


function getMusicbrainz(metadata) {
    let defaultObject = {
        "artist": metadata.artist,
        "track": metadata.track,
        "album": null,
        "playedAt": new Date(),
        "coverArt": null,
        "musicBrainz": {
            "artist": null,
            "track": null,
            "cover": null,
            "error": null
        }
    };


    let buildObject = (artistObj, track, cover) => {
        let builder = {
            "playedAt": new Date(),
            musicBrainz: {artist: null, track: null, cover: null, error: null}
        };

        if(artistObj) {
            builder["artist"] = artistObj.name;
            builder["musicBrainz"]["artist"] = artistObj;
        }

        if(track) {
            let release = musicbrainz.getBestRelease(track);
            builder["track"] = track.title;
            builder["album"] = release.title;
            builder["musicBrainz"]["track"] = track;
        }

        if(cover) {
            builder["cover"] = cover.image
            builder["musicBrainz"]["cover"] = cover;
        }

        return Object.assign(defaultObject, builder);
    };

    return new Promise((resolve, reject) => {
        musicbrainz.artist(metadata.artist).then((artistObj) => {
            if(artistObj) {
                musicbrainz.track(metadata.track, artistObj).then((track) => {
                    if(track) {
                        musicbrainz.coverArt(track).then((cover) => {
                            resolve(buildObject(artistObj, track, cover));
                        });
                    } else {
                        resolve(buildObject(artistObj, track, null));
                    }
                });
            } else {
                resolve(buildObject(artistObj, null, null));
            }
        });
    }).catch((e) => {
        resolve(Object.assign(defaultObject, {"musicBrainz": {"error": e}}));
    });
}
