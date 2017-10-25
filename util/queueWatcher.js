"use strict";

var stomp = require('stomp');
var baseConfig = require('../config');
var jsonConverter = require('./jsonConverter');
var request = require('request');



var config;

var createClient = function (queueType) {
    var stomp_args = {
        port: baseConfig.active_mq.port,
        host: baseConfig.active_mq.host,
        debug: false,
        login: baseConfig.active_mq.user,
        passcode: baseConfig.active_mq.password,
    };

    var client = new stomp.Stomp(stomp_args);

    client.connect();

    return client;

    // setupEventHandlers(client, queueType);
};

var message_callback = function (body, headers) {
    console.log('Message Callback Fired!');
    console.log('Body: ' + body);
};

module.exports = {
    setupQueueWatcher : function(queueType){
        console.log("The queue type is " + queueType);
        config = baseConfig.active_mq[queueType];
        return createClient(queueType);
    },

    setupEventHandlers : function (client) {

        // config = baseConfig.active_mq[queueType];


        client.on('connected', function() {

            var sourceQueues = [
                baseConfig.active_mq.batch.source_queue,
                baseConfig.active_mq.request.source_queue,
                baseConfig.active_mq.score.source_queue
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
            console.log("Got message: " + message.headers['message-id']);
            console.log(JSON.stringify(message.headers));
            console.log(message.body);
            if (message.headers.destination === baseConfig.active_mq.batch.source_queue) {
                var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], "batch");

                console.log("The xml being sent is " + xml);

                client.send({
                    'destination': config.target_queue,
                    'body': xml,
                    'persistent': 'true'
                });

                client.ack(message.headers['message-id']);
            } else if (message.headers.destination === baseConfig.active_mq.request.source_queue) {

                var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], "request");


                // POST XML to url:config.bpm.uri + 'ode/processes/LaunchPointProcess_Processes_Core_ProcessISOCase_Process_ISO_Case_DCM',



                console.log("The xml generated from the ISO request is " + xml);
                client.ack(message.headers['message-id']);





            } else if (message.headers.destination === baseConfig.active_mq.score.source_queue) {
                console.log(JSON.stringify(message.body));
                var xml = jsonConverter.convertJSONMessageToXMl(message.body[0], "score");

                console.log("The xml generated from the ISO score is " + xml);


                // POST XML to config.bpm.uri + 'ode/processes/LaunchPointProcess_Processes_Core_ProcessISOResponse_ISO_Response_Manager_DCM',

                request({
                    url: 'http://192.168.241.203:8080/everteam/ode/processes/LaunchPointProcess_Processes_Core_ProcessISOResponse_ISO_Response_Manager_DCM',
                    headers: {
                        'Content-Type': 'text/xml; charset=utf-8'
                    },
                    method: 'POST',
                    body: xml
                }, function (error, resp, data) {
                    if (error) {
                        console.log("Got an error " + error + " " + JSON.stringify(error));
                        console.error(error);
                    } else {
                        console.log("The resp is " + resp + " " + JSON.stringify(resp));
                        console.log("The data is " + data + " " + JSON.stringify(data));
                    }
                });


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