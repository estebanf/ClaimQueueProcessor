var express = require('express');
var stomp = require('stomp');
var config = require('./config');
var jsonConverter = require('./util/jsonConverter');


var app = express();

module.exports = app;


(function () {
    "use strict";

    // ToDo: I think this logic should be moved into its own module, so that we can have three instances of queue listeners
    // ToDo: without having to copy/paste this 3 times
    var stomp_args = {
        port: config.active_mq.port,
        host: config.active_mq.host,
        debug: false,
        login: config.active_mq.user,
        passcode: config.active_mq.password,
    };

    var client = new stomp.Stomp(stomp_args);

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
    var headers = {
        destination: config.active_mq.batch_source_queue,
        ack: 'client'/*,
        'activemq.prefetchSize': '1'*/
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
        var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], "batch");

        console.log("The xml being sent is " + xml);

        client.send({
            'destination': config.active_mq.batch_target_queue,
            'body': xml,
            'persistent': 'true'
        });

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




