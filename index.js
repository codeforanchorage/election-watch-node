'use strict'

// 3rd party library imports
var express = require('express')
var body_parser = require('body-parser')

// project imports
var text = require('./message_text.json')
var cron_job = require('./cron_job').job
var db = require('./db')
var config = require('./config')

var INITIAL_ADMIN_PHONE = process.env.INITIAL_ADMIN_PHONE
var DEFAULT_URL = process.env.DEFAULT_URL


var app = express() // instantiate express

// Seed the admin list if in env
if (INITIAL_ADMIN_PHONE) {
    if (!config('admins').find(function(item) {
        return item == INITIAL_ADMIN_PHONE
    })) {
        config('admins').push(
            INITIAL_ADMIN_PHONE
        )
    }
}

// Seed the url if in env and not already set
if (DEFAULT_URL) {
    if (!config('url')) {
        config.set('url', DEFAULT_URL).write()
    }
}


// serve files from the public dir for testing via web
app.get('/', express.static(__dirname + '/public'))
// parse POST bodies
app.use(body_parser.urlencoded({ extended: true }))


// Twilio hits this endpoint
app.post('/', function(req, res, next) {
    var message = req.body.Body
    var phone_number = req.body.From

    // this is necessary
    res.set('Content-Type', 'text/plain');

    var is_admin = config('admins').find(function(item) {
        return item == phone_number
    })

    if (is_admin) {
        var commands = message.toLowerCase().split(" ")
        switch (commands[0]) {
            case "get":
                switch (commands[1]) {
                    case "admin":
                    case "admins":
                        return res.send(config('admins').join())
                        break
                    case "url":
                        return res.send(config('url'))
                        break
                    default:
                        return res.send("Unknown GET command")
                }
                break
            case "set":
                switch (commands[1]) {
                    case "admin":
                    case "admins":
                        if (commands[2]) {
                            if (!config('admins').find(function(item) {
                                return item == commands[2]
                            })) {
                                config('admins').push(
                                    commands[2]
                                )
                                return res.send("Admin number set")
                            } else {
                                return res.send("Admin number already set")
                            }

                        } else {
                            return res.send("Missing admin number to set")
                        }
                        break
                    case "url":
                        if (commands[2]) {
                            config.set('url', commands[2]).write()
                            return res.send("URL set")
                        } else {
                            return res.send("Missing URL to set")
                        }
                        break
                    default:
                        return res.send("Unknown SET command")
                }
                break
            case "remove":
                switch (commands[1]) {
                    case "admin":
                    case "admins":
                        if (commands[2]) {
                            if (config('admins').find(function (item) {
                                return item == commands[2]
                            })) {
                                config('admins').remove(function (item) {
                                    return item == commands[2]
                                })
                                return res.send("Admin number removed")
                            } else {
                                return res.send("Admin number not found")
                            }
                        } else {
                            return res.send("Missing admin number to remove")
                        }
                        break
                    case "subscribers":
                        db.set('subscribers', []).write()
                        return res.send("Removed all subscribers")
                        break
                    default:
                        return res.send("Unknown REMOVE command")
                }
                break
            case "help":
                return res.send(text.ADMIN_HELP)
                break
        }
    }

    var is_subscriber = db('subscribers').find(function(item) {
        return item.phone == phone_number
    })

    if (!is_subscriber) {
        db('subscribers').push({
            phone: phone_number,
        })
    }

    if (is_subscriber && message.toLowerCase().trim() === 'stop') {
        db('subscribers').remove(function(item) {
            return item.phone == phone_number
        })
        return res.send(text.GOODBYE)
    }

    return res.send(text.CONFIRMATION)
});


// start the server
var port = process.env.PORT || 3000
app.listen(port, function () {
    console.log('election-watch app running on port', port);
});


// start the cron job
cron_job.start()
