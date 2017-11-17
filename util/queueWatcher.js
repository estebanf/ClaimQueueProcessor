"use strict";

var stomp = require('stomp');
var baseConfig = require('../config');
var jsonConverter = require('./jsonConverter');
var request = require('request');
var xml2json = require('xml2json');

var client, config;

var postToBPMS = function (message) {

    var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], config.message_type);

    console.info("The xml being posted is " + xml);

    console.info("Sending to " + config.endpoint);
    request({
        url:config.endpoint,
        headers:{
            'Content-Type': 'text/xml; charset=utf-8'
        },
        method:'POST',
        body:xml
    },function(err,res,data){
        if(err){
            console.error("Caught an error trying to send a response " + err + " " + JSON.stringify(err));

            if (config.message_type === "batch") {
                var jsonMessage = JSON.parse(message.body[0]);

                var queueResponse = {};
                queueResponse.message = "Caught an error trying to post batch " + jsonMessage.BatchId;
                queueResponse.error = err;

                postToQueue(JSON.stringify(queueResponse));
            }

            } else {
            console.log("The response was " + res + " " + JSON.stringify(res));
            console.log("The data was " + data + " " + JSON.stringify(data));
            console.log("The message.body[0] is " + message.body[0]);

            if (config.message_type === "batch") {
                var response = JSON.parse(xml2json.toJson(data));
                var jsonMessage = JSON.parse(message.body[0]);

                var queueResponse = {};
                queueResponse.batchId = jsonMessage.BatchId;
                queueResponse.pid = response["soapenv:Envelope"]["soapenv:Body"][config.process_response]["tns:pid"]["$t"];
                queueResponse.timestamp = response["soapenv:Envelope"]["soapenv:Body"][config.process_response]["tns:timestamp"]["$t"];

                postToQueue(JSON.stringify(queueResponse));

                console.log("The queue response is " + JSON.stringify(queueResponse));

            }
        }
    });
};

var postToQueue = function (message) {
    // var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], config.message_type);

    console.info("The xml being sent is " + message);

    client.send({
        'destination': config.target_queue,
        'body': message,
        'persistent': 'true'
    });
};

var createClient = function (queueType) {
    var stomp_args = {
        port: baseConfig.active_mq_port,
        host: baseConfig.active_mq_host,
        info: false,
        login: baseConfig.active_mq_user,
        passcode: baseConfig.active_mq_password,
    };

    client = new stomp.Stomp(stomp_args);
    client.connect();
};

var message_callback = function (body, headers) {
    console.info('Message Callback Fired!');
    console.info('Body: ' + body);
};

module.exports = {

    setupQueueProcessors : function () {

        createClient();

        client.on('connected', function() {

            // Subscribe to all source queues
            var sourceQueues = [
                baseConfig.batch.source_queue,
                baseConfig.request.source_queue,
                baseConfig.score.source_queue
            ];
            for (var queueIdx = 0; queueIdx < sourceQueues.length; queueIdx++) {
                var headers = {
                    destination: sourceQueues[queueIdx],
                    ack: 'client'
                };
                client.subscribe(headers, message_callback);

                console.log('Connected to ' + sourceQueues[queueIdx]);
            }
        });

        client.on('message', function(message) {
            console.info("Got message: " + message.headers['message-id']);
            console.info(JSON.stringify(message.headers));
            console.info(message.body);

            // Handle message based on which queue it came from
            if (message.headers.destination === baseConfig.batch.source_queue) {
                config = baseConfig.batch;
                // postToQueue(message);
                postToBPMS(message);
                client.ack(message.headers['message-id']);
            } else if (message.headers.destination === baseConfig.request.source_queue) {
                config = baseConfig.request;
                postToBPMS(message);
                client.ack(message.headers['message-id']);
            } else if (message.headers.destination === baseConfig.score.source_queue) {
                config = baseConfig.score;
                postToBPMS(message);
                client.ack(message.headers['message-id']);
            } else {
                console.error("Unknown queue: " + message.headers.destination);
            }
        });

        client.on('error', function(error_frame) {
            console.log(error_frame.body);
            client.disconnect();
        });
    }
};