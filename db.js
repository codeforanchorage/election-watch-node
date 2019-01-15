'use strict'


var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')
var db = low(new FileSync('db.json'))
db.defaults({
    subscribers: [],
    admin_numbers: [],
    page: 'http://results.elections.alaska.gov/data/results.htm',
}).write()

module.exports = db
