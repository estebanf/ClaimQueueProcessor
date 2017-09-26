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
        var parsedJson = JSON.parse(message.body[0]);
        console.log(parsedJson.BatchId);
        var xml = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:case=\"http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager\" xmlns:laun=\"http://www.example.org/Launchpoint\">" +
            "<soapenv:Header/>" +
            "        <soapenv:Body>" +
            "        <case:Read_case_batchRequest>" +
            "<laun:BatchId>" + parsedJson.BatchId + "</laun:BatchId>\n" +
            "         <laun:EnvironmentId>" + parsedJson.EnvironmentId + "</laun:EnvironmentId>\n" +
            "         <laun:ClientId>" + parsedJson.ClientId + "</laun:ClientId>\n" +
            "         <laun:TotalCaseCount>" + parsedJson.TotalCaseCount + "</laun:TotalCaseCount>\n";

       for (var i = 0; i < parsedJson.Cases; i++) {
           var claimCase = parsedJson[i];
            xml += "         <laun:Cases>\n" +
                "            <laun:CaseId>"+claimCase.CaseId+"</laun:CaseId>\n" +
                "            <laun:ISOIndicator>"+claimCase.ISOIndicator+"</laun:ISOIndicator>\n" +
                "            <laun:Score>" + claimCase.Score + "</laun:Score>\n" +
                "            <laun:AccidentDate>" + claimCase.AccidentDate + "</laun:AccidentDate>\n" +
                "            <laun:BenefitAmount>" + claimCase.BenefitAmount + "</laun:BenefitAmount>\n" +
                "            <laun:FundingSource>" + claimCase.FundingSource + "</laun:FundingSource>\n" +
                "            <laun:LOB>" + claimCase.LOB + "</laun:LOB>\n" +
                "            <laun:State>" + claimCase.State + "</laun:State>\n" +
                "            <laun:WorkComp>" + claimCase.WorkComp + "</laun:WorkComp>\n" +
                "            <laun:CaseStatus>" + claimCase.CaseStatus + "</laun:CaseStatus>\n" +
                "            <laun:CaseSource>" + claimCase.CaseSource + "</laun:CaseSource>\n" +
                "         </laun:Cases>\n";
       }

        xml += "      </case:Read_case_batchRequest>\n" +
        "   </soapenv:Body>\n" +
        "</soapenv:Envelope>";




        client.send({
            'destination': '/queue/LaunchPointProcess_Processes_Core_CaseManagement_Case_Manager_Queue_Service',
            'body': xml,
            'persistent': 'true'
        });

        /*        "         <!--1 or more repetitions:-->\n" +
                    "         <laun:Cases>\n" +
                    "            <laun:CaseId>456</laun:CaseId>\n" +
                    "            <laun:ISOIndicator>1</laun:ISOIndicator>\n" +
                    "            <laun:Score>67</laun:Score>\n" +
                    "            <laun:AccidentDate>2017-05-03</laun:AccidentDate>\n" +
                    "            <laun:BenefitAmount>5000</laun:BenefitAmount>\n" +
                    "            <laun:FundingSource>Medicaid</laun:FundingSource>\n" +
                    "            <laun:LOB>Health</laun:LOB>\n" +
                    "            <laun:State>CO</laun:State>\n" +
                    "            <laun:WorkComp>No</laun:WorkComp>\n" +
                    "            <laun:CaseStatus>Investigate</laun:CaseStatus>\n" +
                    "            <laun:CaseSource>Generated</laun:CaseSource>\n" +
                    "         </laun:Cases>\n" +
                    "         <laun:Cases>\n" +
                    "            <laun:CaseId>456</laun:CaseId>\n" +
                    "            <laun:ISOIndicator>1</laun:ISOIndicator>\n" +
                    "            <laun:Score>67</laun:Score>\n" +
                    "            <laun:AccidentDate>2017-05-03</laun:AccidentDate>\n" +
                    "            <laun:BenefitAmount>5000</laun:BenefitAmount>\n" +
                    "            <laun:FundingSource>Medicaid</laun:FundingSource>\n" +
                    "            <laun:LOB>Health</laun:LOB>\n" +
                    "            <laun:State>CO</laun:State>\n" +
                    "            <laun:WorkComp>No</laun:WorkComp>\n" +
                    "            <laun:CaseStatus>Investigate</laun:CaseStatus>\n" +
                    "            <laun:CaseSource>Generated</laun:CaseSource>\n" +
                    "         </laun:Cases>\n" +*/

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




