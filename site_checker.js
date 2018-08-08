'use strict'

var request = require('request')
var fs = require('fs')
var filename = 'lastFetch.html'


function didSiteChange(url, callback) {
    var lastFetch = fs.readFileSync(filename, 'utf8')
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    }

    request(options, function (err, response, body) {
        if (err) return callback(err)

        // update cache
        fs.writeFileSync(filename, body)

        if (lastFetch != body) return callback(null, true)
        callback(null, false)
    })
}

module.exports.didSiteChange = didSiteChange
