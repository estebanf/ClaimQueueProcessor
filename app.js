var express = require('express');
var app = express();
var queueWatcher = require('./util/queueWatcher');

module.exports = app;


(function () {

    queueWatcher.setupQueueProcessors();

})();




