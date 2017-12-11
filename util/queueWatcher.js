"use strict";

var stomp = require('stomp');
var baseConfig = require('../config');
var jsonConverter = require('./jsonConverter');
var request = require('request');
var xml2json = require('xml2json');
var log4js = require("log4js");

var logger = log4js.getLogger();

var client, config;

var postToBPMS = function (message) {

    var result = jsonConverter.convertJSONMessageToXMl(message.body[0], config.message_type);
    var xml;

    if (typeof result === "object") {
        // Caught an error transforming JSON into XML, so handle the error and exit
        postToQueue(JSON.stringify(result));
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
        
        var queueResponse = {};

        if (err || (res && res.statusCode !== 200)) {
            queueResponse = findMessageValues(config.error_params, message);
            if (err) {
                queueResponse.error = err;
            } else {
                queueResponse.error = res;
            }

            postToQueue(JSON.stringify(queueResponse));

        } else {
            logger.info("The response was " + res + " " + JSON.stringify(res));
            logger.info("The data is " + data + " " + JSON.stringify(data));

            queueResponse = findMessageValues(config.response_params, message);

            // Pull any other values out of the response returned from the process
            var response = JSON.parse(xml2json.toJson(data));
            findResponseValues("", response, queueResponse);

            postToQueue(JSON.stringify(queueResponse));

            logger.info("The queue response is " + JSON.stringify(queueResponse));


        }
    });
};

var findMessageValues = function (keyStr, message) {
    // Pull response or error params out of the message that was posted to the source queue
    var retval = {};
    var jsonMessage = JSON.parse(message.body[0]);
    var keys = keyStr.split(",");
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        retval[key] = jsonMessage[key];
    }
    return retval;
};

var findResponseValues = function (parent, ob, retval) {
    // Iterate through the keys in the current object, looking for $t, which represents a value, for JSON in the form of
    /*
        {
          "soapenv:Envelope": {
            "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
            "soapenv:Body": {
              "Receive_resultsResponse": {
                "xmlns": "http://bpms.everteam.com/Processes/Core/ProcessIQCase/Queue_Monitor",
                "Launchpoint:pid": {
                  "xmlns:Launchpoint": "http://www.example.org/Launchpoint",
                  "$t": "12952"
                },
                "Launchpoint:timestamp": {
                  "xmlns:Launchpoint": "http://www.example.org/Launchpoint",
                  "$t": "2017-12-07T14:00:23.898-07:00"
                }
              }
            }
          }
        }
     */
    for (var keyIdx = 0; keyIdx < Object.keys(ob).length; keyIdx++) {
        var key = Object.keys(ob)[keyIdx];
        if (key === "$t") {
            var keyNameSansNamespace = parent.substr(parent.indexOf(":") + 1);
            retval[keyNameSansNamespace] = ob[key];
        }
    }

    // Iterate again, to find values that are objects (to recurse on)
    for (var keyIdx = 0; keyIdx < Object.keys(ob).length; keyIdx++) {
        var key = Object.keys(ob)[keyIdx];
        if (typeof ob[key] === "object") {
            findResponseValues(key, ob[key], retval);
        }
    }
};

var postToQueue = function (message, queue) {
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
                baseConfig.letter.source_queue,
                baseConfig.iqbatch.source_queue,
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
            } else if (message.headers.destination === baseConfig.letter.source_queue) {
                logger.info("Got here with message " + JSON.stringify(message));
                config = baseConfig.letter;
                postToBPMS(message);
                client.ack(message.headers['message-id']);
            } else if (message.headers.destination === baseConfig.iqbatch.source_queue) {
                logger.info("Got here with message " + JSON.stringify(message));
                config = baseConfig.iqbatch;
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