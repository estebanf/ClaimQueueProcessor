var express = require('express');
var app = express();
var queueWatcher = require('./util/queueWatcher');

module.exports = app;


(function () {
    var client = queueWatcher.setupQueueWatcher("batch");

    queueWatcher.setupEventHandlers(client, "batch");
/*    queueWatcher.setupEventHandlers(client, "request");
    queueWatcher.setupEventHandlers(client, "score");*/
})();




