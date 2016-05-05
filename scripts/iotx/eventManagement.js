var analytics = require("iotx/analytics");

/**
 * Parent class of all Event types managers. Allows for the management of new event types
 * Sub-classes should implement the parse and prepareEvents methods.
 * @class EventManager
 * @class constructor
 */
function EventManager() {
  this.analytics = new analytics.AnalyticsDelegate();
}

/**
 * Template method that runs a simple 3 steps process:
 * 1) parse the received msg to retrieve the required data
 * 2) transform the data into a suitable structure to send to the analytics service
 * 3) stream the events to the analytics service
 * @method ingest
 * @param {Object} [msg] : the message to handle 
 * @throws {Error}
 */
EventManager.prototype.ingest = function(msg) {  

  var data = this.parse(msg);
  var dto = this.prepareEvents(data);
  return this.streamEvent(dto);
};

/** 
 * Parse the received msg to retrieve the required data
 * @method parse
 * @param {Object} [msg] : the message to parse
 * @return {Object} a new data structure only containing relevant information
 * @throws {Error}
 */
EventManager.prototype.parse = function(msg) {  
  
  throw {
    errorCode: "Not_Implemented"
  };
};

/** 
 * Transform parse data into a collection of events meant to be sent to the analytics service
 * @method prepareEvents
 * @param {Object} [data] : the parsed data
 * @return {Object} {bucketId: target_bucket_id, bucketName: target_bucket_name, events: array_of_key/value_events} 
 * @throws {Error}
 */
EventManager.prototype.prepareEvents = function(data) {
  
  throw {
    errorCode: "Not_Implemented"
  };
};

/**
 * Streams events to the analytics provider
 * @method streamEvent
 * @param {Object} [dto]
 * @param {String} [dto.bucketId] : identifier of the target bucket
 * @param {String} [dto.bucketName] : name of the target bucket
 * @param {Array} [dto.events] : arrat of events {key, value}
 */
EventManager.prototype.streamEvent = function(dto) {  
  return this.analytics.streamEvents(dto);  
};
