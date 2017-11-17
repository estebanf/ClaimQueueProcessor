"use strict";

var stomp = require('stomp');
var baseConfig = require('../config');
var jsonConverter = require('./jsonConverter');
var request = require('request');
var xml2json = require('xml2json');
var log4js = require("log4js");
log4js.configure({
    appenders: {
        everything: { type: 'dateFile', filename: 'all-the-logs.log', pattern: '.yyyy-MM-dd-hh', compress: true }
    },
    categories: {
        default: { appenders: [ 'everything' ], level: 'info'}
    }
});

var logger = log4js.getLogger();

var client, config;

var postToBPMS = function (message) {

    var result = jsonConverter.convertJSONMessageToXMl(message.body[0], config.message_type);
    var xml;

    if (typeof result === "object") {
        // Caught an error transforming JSON into XML, so handle the error and exit
        handleError(message.body[0], result, false);
        return;
    } else {
        xml = result;
    }

    logger.info("The xml being posted is " + xml);

    logger.info("Sending to " + config.endpoint);
    request({
        url: config.endpoint,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8'
        },
        method: 'POST',
        body: xml
    }, function (err, res, data) {
        if (err) {
            logger.error("Caught an error trying to send a response " + err + " " + JSON.stringify(err));

            var error = {
                message: "Caught an error attempting to communicate with BPMS about queue message " + message.body[0],
                error: err
            }

            handleError(message.body[0], error, true);

        } else {
            logger.info("The response was " + res + " " + JSON.stringify(res));
            logger.info("The data was " + data + " " + JSON.stringify(data));
            logger.info("The message.body[0] is " + message.body[0]);

            if (config.message_type === "batch") {
                var response = JSON.parse(xml2json.toJson(data));
                var jsonMessage = JSON.parse(message.body[0]);

                var queueResponse = {};
                queueResponse.batchId = jsonMessage.BatchId;
                queueResponse.pid = response["soapenv:Envelope"]["soapenv:Body"][config.process_response]["tns:pid"]["$t"];
                queueResponse.timestamp = response["soapenv:Envelope"]["soapenv:Body"][config.process_response]["tns:timestamp"]["$t"];

                postToQueue(JSON.stringify(queueResponse));

                logger.info("The queue response is " + JSON.stringify(queueResponse));

            }
        }
    });
};

var handleError = function (queueMessage, error, reenqueue) {

    // Post the error message to the target queue
    postToQueue(JSON.stringify(error));

    // Re-enqueue the message to be processed again
    if (reenqueue) {
        // postToQueue(queueMessage, config.source_queue);
    }
};

var postToQueue = function (message, queue) {
    // var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], config.message_type);

    logger.info("The xml being sent is " + message);

    client.send({
        'destination': queue ? queue : config.target_queue,
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
    logger.info('Message Callback Fired!');
    logger.info('Body: ' + body);
};

module.exports = {

    setupQueueProcessors: function () {

        createClient();

        client.on('connected', function () {

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

                logger.info('Connected to ' + sourceQueues[queueIdx]);
            }
        });

        client.on('message', function (message) {
            logger.info("Got message: " + message.headers['message-id']);
            logger.info(JSON.stringify(message.headers));
            logger.info(message.body);

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
                logger.error("Unknown queue: " + message.headers.destination);
            }
        });

        client.on('error', function (error_frame) {
            logger.info(error_frame.body);
            client.disconnect();
        });
    }
};