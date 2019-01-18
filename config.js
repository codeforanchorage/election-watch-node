'use strict'


var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')
var config = low(new FileSync('config.json'))
config.defaults({
    admins: [],
    url: ''
}).write()

module.exports = config