var config = {};

config.active_mq = {};
config.everteam = {};

config.active_mq.host = process.env.ACTIVEMQ_HOST || 'localhost';
config.active_mq.port = process.env.ACTIVEMQ_PORT || 61613;
config.active_mq.user = process.env.ACTIVEMQ_USER || 'admin';
config.active_mq.password=  process.env.ACTIVEMQ_PASSWORD || 'admin';
config.active_mq.source_queue = process.env.ACTIVEMQ_SOURCE_QUEUE || '/queue/test';
config.active_mq.target_queue = process.env.ACTIVEMQ_TARGET_QUEUE || '/queue/test2';

config.everteam.process_namespace = "http://bpms.everteam.com/Processes/Core/CaseManagement/Case_Manager";
config.everteam.schema_namespace = "http://www.example.org/Launchpoint";
config.everteam.process_request="Read_case_batchRequest";

module.exports = config;