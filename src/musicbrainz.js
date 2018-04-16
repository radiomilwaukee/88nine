var http = require('http');

exports.artist = (name) => {
  return new Promise((resolve, reject) => {
    http.get({
      protocol: "http:",
      hostname: "musicbrainz.org",
      headers: {
        "User-Agent": "Application 88nine/0.1.0 (radiomilwaukee.org)"
      },
      path: `/ws/2/artist?query=artist:${encodeURIComponent(name)}&fmt=json`
    }, (response) => {
      var body = "";
      response.on('data', (chunk) => body += chunk)
      response.on('end', () => resolve(JSON.parse(body)))
    })
  }).then((artists) => {
    if(artists.artists.length > 0) {
      return {
        id: artists.artists[0].id,
        name: artists.artists[0].name
      }
    } else {
      return null;
    }
  })
}

exports.track = (name, artist) => {
  return new Promise((resolve, reject) => {
    http.get({
      protocol: "http:",
      hostname: "musicbrainz.org",
      headers: {
        "User-Agent": "Application 88nine/0.1.0 (radiomilwaukee.org)"
      },
      path: `/ws/2/recording?query="${encodeURIComponent(name)}"%20AND%20arid:${artist.id}&fmt=json`
    }, (response) => {
      var body = "";
      response.on('data', (chunk) => body += chunk)
      response.on('end', () => resolve(JSON.parse(body)))
    })
  }).then((json) => {
    return json.recordings[0]
  });
}

exports.coverArt = (albumTitle, recording) => {
  let release = getBestRelease(albumTitle, recording)["release-group"]["id"];
  if(release) {
    return new Promise((resolve, reject) => {
      http.get({
        protocol: "http:",
        hostname: "coverartarchive.org",
        headers: {
          "User-Agent": "Application 88nine/0.1.0 (radiomilwaukee.org)",
          "Accept": "application/json"
        },
        path: `/release-group/${release}`,
      }, (response) => {
        if(response.statusCode == 200) {
          var body = "";
          response.on('data', (chunk) => body += chunk)
          response.on('end', () => resolve(JSON.parse(body)))
        } else {
          resolve(null)
        }
      })
    }).then((json) => {
      return json
    });
  } else {
    return new Promise((resolve, reject) => resolve({}))
  }
}


function getBestRelease(albumTitle, recording) {
  return recordings.releases.find((r) => {
    return r["title"] == albumTitle
  });
}

