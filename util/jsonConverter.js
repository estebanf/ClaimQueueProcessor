
var soapEnvelopeHeader = "<soapenv:Envelope" +
    " xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\"" +
    " xmlns:case=\"http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager\"" +
    " xmlns:laun=\"http://www.example.org/Launchpoint\">" +
    "<soapenv:Header/>\n" +
    "    <soapenv:Body>\n";

var requestStartTag = "<case:Read_case_batchRequest>\n";
var requestEndTag = "</case:Read_case_batchRequest>\n";

var soapEnvelopeFooter = "" +
    "   </soapenv:Body>\n" +
    "</soapenv:Envelope>";


var convertJsonStringToObject = function (jsonString) {
    var jsonObject;
    try {
        jsonObject = JSON.parse(jsonString);
    } catch (e) {
        console.error("Caught an error converting json to xml " + e);
    }
    return jsonObject;
};

var parseBatch = function (json) {
/*    "<laun:BatchId>" + parsedJson.BatchId + "</laun:BatchId>\n" +
    "         <laun:EnvironmentId>" + parsedJson.EnvironmentId + "</laun:EnvironmentId>\n" +
    "         <laun:ClientId>" + parsedJson.ClientId + "</laun:ClientId>\n" +
    "         <laun:TotalCaseCount>" + parsedJson.TotalCaseCount + "</laun:TotalCaseCount>\n";*/
    var batch = "";
    for (var key in json) {
        if (!Array.isArray(json[key])) {
            batch += "<laun:" + key + ">" + json[key] + "</laun:"+key+">\n";
        }
    }
    console.log("The batch is " + batch);
    return batch;
};

var parseCases = function (json) {

/*for (var i = 0; i < parsedJson.Cases.length; i++) {
           var claimCase = parsedJson.Cases[i];
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
       }*/
    var cases = "";
    for (var i = 0; i < json.Cases.length; i++) {
        var claimCase = json.Cases[i];
        cases += "<laun:Cases>"
        for (var key in claimCase) {
            cases += "<laun:" + key + ">" + claimCase[key] + "</laun:" + key + ">\n";
        }
        cases += "</laun:Cases>\n"
    }
    console.log("The cases are " + cases);
    return cases;
};

var constructXmlMessage = function (batch, cases) {
    return soapEnvelopeHeader +
        requestStartTag +
        batch +
        cases +
        requestEndTag +
        soapEnvelopeFooter;
}

module.exports =
    {

        convertJSONMessageToXMl : function (jsonMessage) {
            var json = convertJsonStringToObject(jsonMessage);
            if (!json) return "";
            var batch = parseBatch(json);
            var cases = parseCases(json);
            return constructXmlMessage(batch, cases);
        }

    };
