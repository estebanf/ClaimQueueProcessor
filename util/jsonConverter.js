
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

var createXMLElement = function (namespace, elementName, elementValue, createEndTag) {
    var xml = "";
    if (elementValue === null || typeof elementValue === "undefined") {
        xml = createEndTag ? "</" : "<";
        xml += namespace + ":" + elementName + ">\n";
    } else {
        xml = "<" + namespace + ":" + elementName + ">" + elementValue + "</" + namespace + ":" + elementName + ">\n";
    }
    return xml;
};

var convertJsonStringToObject = function (jsonString) {
    var jsonObject;
    try {
        jsonObject = JSON.parse(jsonString);
    } catch (e) {
        console.error("Caught an error converting json to xml " + e);
    }
    return jsonObject;
};

var parseObject = function (json) {
    var xml = "";
    for (var key in json) {
        if (Array.isArray(json[key])) {
            xml += parseArray(key, json[key]);
        } else {
            xml += createXMLElement("laun", key, json[key]);
        }
    }
    console.log("The translated json is " + xml);
    return xml;
};

var parseArray = function (arrayName, json) {

    var xml = "";
    for (var i = 0; i < json.length; i++) {
        var object = json[i];
        xml += createXMLElement("laun", arrayName, null, false);
        for (var key in object) {
            xml += createXMLElement("laun", key, object[key]);
        }
        xml += createXMLElement("laun", arrayName, null, true);
    }
    console.log("The translated array xml is " + xml);
    return xml;
};

var constructXmlMessage = function (xmlBody) {
    return soapEnvelopeHeader +
        requestStartTag +
        xmlBody +
        requestEndTag +
        soapEnvelopeFooter;
}

module.exports =
    {

        convertJSONMessageToXMl : function (jsonMessage) {
            var json = convertJsonStringToObject(jsonMessage);
            if (!json) return "";

            var xml = parseObject(json);

            return constructXmlMessage(xml);
        }

    };
