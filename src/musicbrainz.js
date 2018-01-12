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
      return artists.artists[0]
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
      response.on('end', () => resolve(JSON.parse(body)));
    })
  }).then((json) => {
      let sortedRecordings = json.recordings.sort((a, b) => a.score - b.score);
      return sortedRecordings[sortedRecordings.length-1];
  });
}


exports.coverArt = (recording) => {
    let release = getBestRelease(recording)["release-group"]["id"];
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


function getBestRelease(recording) {
    // Group releases. If there is a common release group use that.
    let groupedReleases = recording.releases.reduce((acc, i) => {
        let rg = i["release-group"];
        if(rg) {
            let val = acc[rg.id] || 0;
            acc[rg.id]++;
            return acc;
        }
    }, {});

    let release = null;
    let maxLength = 0;

    // Use the most commonly used group.
    for (var key in groupedReleases ) {
        let val = groupedReleases[key];
        if(val > maxLength && val != 1) {
            release = recording.releases.find((i) => {
                let rg = i["release-group"];
                return rg && rg["id"] == key;
            });
        }
    }

    // If we don't have a common release group, find the first official one with type EP
    if(!release) {
        release = recording.releases.find(function(i){
            let rg = i["release-group"];
            return i["status"] == 'Official' && rg && rg["primary-type"] == "EP";
        });

    }

    // If not try to find the first Official and US release with a group
    if(!release) {
        release = recording.releases.find(function(i){
            let rg = i["release-group"];
            return rg && i["status"] == 'Official' && i['country'] == 'US';
        });
    }

    // Get the first release group we have
    if(!release) {
        release = recording.releases.find((i)=> {
            let rg = i["release-group"];
            return !!rg;
        });
    }

    return release;
}

exports.getBestRelease = getBestRelease;
