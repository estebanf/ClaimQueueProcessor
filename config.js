var baseURL = process.env.BPMS_URI ||  "http://bpms.everteam.us:8080/everteam/ode/processes/";

var config = {};

config.batch = {};
config.request = {};
config.letter = {};
config.iqbatch = {};
config.score = {};

config.active_mq_host = process.env.ACTIVEMQ_HOST || 'bpms.everteam.us';
config.active_mq_port = process.env.ACTIVEMQ_PORT || 61613;
config.active_mq_user = process.env.ACTIVEMQ_USER || 'admin';
config.active_mq_password=  process.env.ACTIVEMQ_PASSWORD || 'admin';

config.batch.source_queue = process.env.ACTIVEMQ_BATCH_SOURCE_QUEUE || '/queue/BatchCases';
config.batch.target_queue = process.env.ACTIVEMQ_BATCH_TARGET_QUEUE || '/queue/BatchCasesResponse';

config.request.source_queue = process.env.ACTIVEMQ_REQUEST_SOURCE_QUEUE || '/queue/iso_request';
config.request.target_queue = process.env.ACTIVEMQ_REQUEST_TARGET_QUEUE || '/queue/iso_request_response';

config.letter.source_queue = process.env.ACTIVEMQ_LETTER_SOURCE_QUEUE || '/queue/iq_letter';
config.letter.target_queue = process.env.ACTIVEMQ_LETTER_TARGET_QUEUE || '/queue/iq_letter_response';

config.iqbatch.source_queue = process.env.ACTIVEMQ_IQBATCH_SOURCE_QUEUE || '/queue/iq_batch';
config.iqbatch.target_queue = process.env.ACTIVEMQ_IQBATCH_TARGET_QUEUE || '/queue/iq_batch_response';

config.score.source_queue = process.env.ACTIVEMQ_SCORE_SOURCE_QUEUE || '/queue/iso_score';
config.score.target_queue = process.env.ACTIVEMQ_SCORE_TARGET_QUEUE || '/queue/iso_score_response';

config.bpms_schema_namespace = "http://www.example.org/Launchpoint";

config.batch.message_type="batch";
config.batch.process_namespace = "http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager";
config.batch.process_request="Read_case_batchRequest";
config.batch.process_response="Read_case_batchResponse";
config.batch.response_params="EnvironmentId,BatchId,ClientId";
config.batch.endpoint=baseURL + "LaunchPointProcess_Processes_Core_CaseManagement_Case_Manager_Queue_Service";


config.request.message_type="request";
config.request.process_namespace = "http://www.example.org/Launchpoint";
config.request.process_request="DCMISORequestFile";
config.request.process_response="DCMISORequestFile";
config.request.response_params="CaseId";
config.request.endpoint=baseURL + "LaunchPointProcess_Processes_Core_ProcessISOCase_Process_ISO_Case_DCM";

config.letter.message_type="letter";
config.letter.process_namespace = "http://bpms.everteam.com/Processes/Core/ProcessIQCase/Queue_Monitor";
config.letter.process_request="Receive_resultsRequest";
config.letter.process_response="Receive_resultsResponse";
config.letter.response_params="CaseId"
config.letter.endpoint=baseURL + "LaunchPointProcess_Processes_Core_ProcessIQCase_Queue_Monitor_DCM";

config.iqbatch.message_type="iqbatch";
config.iqbatch.process_namespace = "http://bpms.everteam.com/Processes/Core/ProcessIQCase/Queue_Monitor";
config.iqbatch.process_request="Receive_IQ_Batch_ResultsRequest";
config.iqbatch.process_response="Receive_IQ_Batch_ResultsResponse";
config.iqbatch.response_params="IQBatchId";
config.iqbatch.endpoint=baseURL + "LaunchPointProcess_Processes_Core_ProcessIQCase_Queue_Monitor_DCM";

config.score.message_type="score";
config.score.process_namespace = "http://bpms.everteam.com/Processes/Core/ProcessISOResponse/ISO_Response_Manager";
config.score.process_request="Receive_ScoringRequest";
config.score.process_response="Receive_ScoringResponse";
config.score.response_params="CaseId";
config.score.endpoint=baseURL + "LaunchPointProcess_Processes_Core_ProcessISOResponse_ISO_Response_Manager_DCM";

module.exports = config;
