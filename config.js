'use strict'


var low = require('lowdb')
var storage = require('lowdb/file-sync')

module.exports = low('config.json', { storage: storage })
