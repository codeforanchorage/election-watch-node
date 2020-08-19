'use strict'

var request = require('request')
var fs = require('fs')
var filename = 'lastFetch.html'


function didSiteChange(url, callback) {
    var lastFetch = null

    try {
        lastFetch = fs.readFileSync(filename, 'utf8')
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // we have no baseline yet, it's okay.
        }
    }

    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    }

    request(options, function (err, response, body) {
        if (err) return callback(err)

        // remove scripts in the body
        var filteredBody = body.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')

        // update cache
        fs.writeFileSync(filename, filteredBody)

        // handle the case of having no lastFetch
        if (!lastFetch) return callback(null, false)

        // handle case of a differring last fetch
        if (lastFetch != filteredBody) return callback(null, true)

        callback(null, false)
    })
}

function resetFile() {
    fs.unlinkSync(filename)
}

module.exports.didSiteChange = didSiteChange
module.exports.resetFile = resetFile
