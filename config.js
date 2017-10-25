var config = {};

config.active_mq = {};
config.everteam = {};

config.active_mq.host = process.env.ACTIVEMQ_HOST || 'localhost';
config.active_mq.port = process.env.ACTIVEMQ_PORT || 61613;
config.active_mq.user = process.env.ACTIVEMQ_USER || 'admin';
config.active_mq.password=  process.env.ACTIVEMQ_PASSWORD || 'admin';

config.active_mq.batch = {};
config.active_mq.request = {};
config.active_mq.score = {};

config.active_mq.batch.source_queue = process.env.ACTIVEMQ_BATCH_SOURCE_QUEUE || '/queue/test';
config.active_mq.batch.target_queue = process.env.ACTIVEMQ_BATCH_TARGET_QUEUE || '/queue/LaunchPointProcess_Processes_Core_CaseManagement_Case_Manager_Queue_Service';

config.active_mq.request.source_queue = process.env.ACTIVEMQ_REQUEST_SOURCE_QUEUE || '/queue/iso_request';
config.active_mq.request.target_queue = process.env.ACTIVEMQ_REQUEST_TARGET_QUEUE || '/queue/LaunchPointProcess_Processes_Core_ProcessISOCase_Process_ISO_Case_DCM';

config.active_mq.score.source_queue = process.env.ACTIVEMQ_SCORE_SOURCE_QUEUE || '/queue/iso_score';
config.active_mq.score.target_queue = process.env.ACTIVEMQ_SCORE_TARGET_QUEUE || 'LaunchPointProcess_Processes_Core_ProcessISOResponse_ISO_Response_Manager_DCM';


config.everteam.schema_namespace = "http://www.example.org/Launchpoint";

config.everteam.batch = {};
config.everteam.request = {};
config.everteam.score = {};

config.everteam.batch.process_namespace = "http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager";
config.everteam.batch.process_request="Read_case_batchRequest";

config.everteam.request.process_namespace = "http://www.example.org/Launchpoint";
config.everteam.request.process_request="DCMISORequestFile";

config.everteam.score.process_namespace = "http://bpms.everteam.com/Processes/Core/ProcessISOResponse/ISO_Response_Manager";
config.everteam.score.process_request="Receive_ScoringRequest";

module.exports = config;