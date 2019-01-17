'use strict'


var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')
var db = low(new FileSync('db.json'))
db.defaults({
    subscribers: []
}).write()

module.exports = db
