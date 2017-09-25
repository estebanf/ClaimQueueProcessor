var express = require('express');
var stomp = require('stomp');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

module.exports = app;


(function () {
    "use strict";

    var stomp_args = {
        port: 61613,
        host: 'localhost',
        debug: false,
        login: 'guest',
        passcode: 'guest',
    };

    var client = new stomp.Stomp(stomp_args);

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
    var headers = {
        destination: '/queue/test',
        ack: 'client',
        'activemq.prefetchSize': '1'
    };

    client.connect();

    function message_callback(body, headers) {
        console.log('Message Callback Fired!');
        console.log('Body: ' + body);
    }

    client.on('connected', function() {
        client.subscribe(headers, message_callback);
        console.log('Connected');
    });

    client.on('message', function(message) {
        console.log("Got message: " + message.headers['message-id']);
        console.log(message.body);
        client.ack(message.headers['message-id']);
    });

    client.on('error', function(error_frame) {
        console.log(error_frame.body);
        client.disconnect();
    });

    // Notify someone that the process has gone down?
    /*process.on('SIGINT', function() {
        console.log('\nConsumed ' + messages + ' messages');
        client.disconnect();
    });*/
})();




