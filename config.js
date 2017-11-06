var baseURL = process.env.BPMS_URI ||  "http://bpms.everteam.us:8080/everteam/";

var config = {};

config.batch = {};
config.request = {};
config.score = {};

config.active_mq_host = process.env.ACTIVEMQ_HOST || 'bpms.everteam.us';
config.active_mq_port = process.env.ACTIVEMQ_PORT || 61613;
config.active_mq_user = process.env.ACTIVEMQ_USER || 'admin';
config.active_mq_password=  process.env.ACTIVEMQ_PASSWORD || 'admin';

config.batch.source_queue = process.env.ACTIVEMQ_BATCH_SOURCE_QUEUE || '/queue/BatchCases';
config.batch.target_queue = process.env.ACTIVEMQ_BATCH_TARGET_QUEUE || '/queue/LaunchPointProcess_Processes_Core_CaseManagement_Case_Manager_Queue_Service';

config.request.source_queue = process.env.ACTIVEMQ_REQUEST_SOURCE_QUEUE || '/queue/iso_request';

config.score.source_queue = process.env.ACTIVEMQ_SCORE_SOURCE_QUEUE || '/queue/iso_score';

config.bpms_schema_namespace = "http://www.example.org/Launchpoint";

config.batch.message_type="batch";
config.batch.process_namespace = "http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager";
config.batch.process_request="Read_case_batchRequest";

config.request.message_type="request";
config.request.process_namespace = "http://www.example.org/Launchpoint";
config.request.process_request="DCMISORequestFile";
config.request.endpoint=baseURL + "ode/processes/LaunchPointProcess_Processes_Core_ProcessISOCase_Process_ISO_Case_DCM";

config.score.message_type="score";
config.score.process_namespace = "http://bpms.everteam.com/Processes/Core/ProcessISOResponse/ISO_Response_Manager";
config.score.process_request="Receive_ScoringRequest";
config.score.endpoint=baseURL + "ode/processes/LaunchPointProcess_Processes_Core_ProcessISOResponse_ISO_Response_Manager_DCM";

module.exports = config;
