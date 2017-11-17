var express = require('express');
var app = express();
var queueWatcher = require('./util/queueWatcher');
var log4js = require("log4js");
log4js.configure({
    appenders: {
        everything: { type: 'dateFile', filename: 'claimQueueProcessor.log'}
    },
    categories: {
        default: { appenders: [ 'everything' ], level: 'info'}
    }
});
module.exports = app;


(function () {

    queueWatcher.setupQueueProcessors();

})();




