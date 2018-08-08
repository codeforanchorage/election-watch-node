'use strict'

// 3rd party library imports
var express = require('express')
var body_parser = require('body-parser')

// project imports
var text = require('./message_text.json')
var cron_job = require('./cron_job').job
var db = require('./db')


var app = express() // instantiate express


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
