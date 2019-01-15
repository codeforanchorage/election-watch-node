'use strict'

// 3rd party library imports
var cron = require('cron')
var twilio = require('twilio')

// project imports
var db = require('./db')
var config = require('./config')
var message_text = require('./message_text.json')
var site_checker = require('./site_checker')


// constants
var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
var TWILIO_NUMBER = process.env.TWILIO_NUMBER


var job = new cron.CronJob({
    // run every minute
    cronTime: '* * * * *',
    // cronTime: '* * * * *', // every minute
    onTick: sendMessages,
    timeZone: 'America/Anchorage'
});


function sendMessages() {
    // instantiating this here so it'll run without an auth token in dev
    var twilio_client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // get weather
    site_checker.didSiteChange(
        config('url'),
        function (err, changed) {
            if (err) return console.log(err)

            if (!changed) {
                console.log('no change')
                return
            }

            console.log('it changed! texting people now')

            db('subscribers').forEach(function(subscriber) {
                console.log(subscriber)
                twilio_client.sendMessage(
                    {
                        to: subscriber.phone,
                        from: TWILIO_NUMBER,
                        body: message_text.NOTIFICATION + config('url'),
                    },
                    function (err, response) {
                        if (err) return console.log(err)

                        console.log(response)
                    }
                )
            })
        }
    )
}

module.exports.job = job
module.exports.sendMessages = sendMessages
