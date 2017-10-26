var baseConfig = require("../config.js");

// Initialized by convertJSONMessageToXMl
var config;

/**
 * Everteam generates namespace prefixes by lowercasing the first four letters of the last path element
 * Duplicate that logic, so that namespaces can be computed instead of hardcoded
 * @param namespace
 * @returns {string}
 */
var createSchemaPrefix = function (namespace) {
    var lastPathElemStart = namespace.lastIndexOf("/");
    var lastPathElem =  namespace.substr(lastPathElemStart + 1, 4);

    // If last character is _, pull it off
    if (lastPathElem[lastPathElem.length -1] === '_') {
        lastPathElem = lastPathElem.substr(0,3);
    }
    return lastPathElem.toLowerCase();
};

// Used when referencing schema elements; i.e, <laun:batchId>
var schemaNamespacePrefix;
// Used when referencing process elements, such as the name of the message event
var processNamespacePrefix;

/**
 * A helper method to assemble an xml element string
 * @param namespace
 * @param elementName
 * @param elementValue - if null, a start or end tag is created based on the value of createEndTag. If not null, both a
 *                       beginning and end tag will be created.
 * @param createEndTag - if true, creates only an end tag. If false, creates a beginning tag
 * @returns {string} - The xml fragment
 */
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

var initializeNamespaces = function () {
    schemaNamespacePrefix = createSchemaPrefix(baseConfig.bpms_schema_namespace);
    processNamespacePrefix = createSchemaPrefix(config.process_namespace);
};

/**
 * Tries to parse the given string as JSON. If parsing fails, prints to the error log and returns an undefined object
 * @param jsonString
 * @returns {*}
 */
var convertJsonStringToObject = function (jsonString) {
    var jsonObject;
    try {
        jsonObject = JSON.parse(jsonString);
    } catch (e) {
        console.error("Caught an error converting json to xml " + e);
        console.error(jsonString);
    }
    return jsonObject;
};

/**
 * Takes a json object and outputs the equivalent XML. Does NOT handle nested objects
 * @param json
 * @returns {string}
 */
var parseObject = function (json) {
    var xml = "";
    for (var key in json) {
        if (Array.isArray(json[key])) {
            xml += parseArray(key, json[key]);
        } else {
            xml += createXMLElement(schemaNamespacePrefix, key, json[key]);
        }
    }
    console.log("The translated json is " + xml);
    return xml;
};

/**
 * Takes an array of JSON objects and converts them to the equivalent XML
 * @param arrayName
 * @param json
 * @returns {string}
 */
var parseArray = function (arrayName, json) {
    var xml = "";
    for (var i = 0; i < json.length; i++) {
        var object = json[i];
        xml += createXMLElement(schemaNamespacePrefix, arrayName, null, false);
        xml += parseObject(object);
        xml += createXMLElement(schemaNamespacePrefix, arrayName, null, true);
    }
    console.log("The translated array xml is " + xml);
    return xml;
};

/**
 * Assembles the entire SOAP message
 * @param xmlBody
 * @returns {string}
 */
var constructXmlMessage = function (xmlBody) {
    var soapEnvelopeHeader = "<soapenv:Envelope" +
        " xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\"" +
        " xmlns:" + processNamespacePrefix + "=\"" + config.process_namespace + "\"";

    if (baseConfig.bpms_schema_namespace !== config.process_namespace) {
        soapEnvelopeHeader += " xmlns:" + schemaNamespacePrefix + "=\"" + baseConfig.bpms_schema_namespace + "\">";
    } else {
        soapEnvelopeHeader += ">";
    }
    soapEnvelopeHeader += "<soapenv:Header/>\n" +
        "    <soapenv:Body>\n";

    var requestStartTag = createXMLElement(processNamespacePrefix, config.process_request, null, false);
    var requestEndTag = createXMLElement(processNamespacePrefix, config.process_request, null, true);

    var soapEnvelopeFooter = "" +
        "   </soapenv:Body>\n" +
        "</soapenv:Envelope>";

    return soapEnvelopeHeader +
        requestStartTag +
        xmlBody +
        requestEndTag +
        soapEnvelopeFooter;
}

module.exports =
    {

        /**
         * Takes a string (assumed to be valid JSON) and attempts to convert it to a SOAP-based XML string
         * @param jsonMessage
         * @returns {*}
         */
        convertJSONMessageToXMl: function (jsonMessage, queue) {
            // Use the correct config object, based on which queue the message is coming from
            config = baseConfig[queue];

            initializeNamespaces();

            var json = convertJsonStringToObject(jsonMessage);
            if (!json) return "";

            var xml = parseObject(json);

            return constructXmlMessage(xml);
        }

    };
