var eventManagement = require("iotx/eventManagement");

/**
 * This class knows how to parse customer specific messages
 * @CustomerManager
 * @extends EventManager
 * @constructor
 */
function CustomerManager() {
}

CustomerManager.prototype = new eventManagement.EventManager();
CustomerManager.prototype.constructor = CustomerManager;

/** 
 * Parse the received msg to retrieve the required data
 * @method parse
 * @param {Object} [msg] : the message to parse
 * @return {Object} a new data structure only containing relevant information
 * @throws {Error}
 */
CustomerManager.prototype.parse = function(msg) {
  
  var customerData = {      
    
    id: msg.data.CustomerID,
    time: msg.data.Time
  };
 
  var data = JSON.parse(msg.data.CustomerData);
  customerData["alr.pro"] = data.alr.pro;
  customerData["alr.ver"] = data.alr.ver;
  return customerData;
};

/** 
 * Transform parse data into a collection of events meant to be sent to the analytics service
 * @method prepareEvents
 * @param {Object} [data] : the parsed data
 * @return {Object} {bucketId: target_bucket_id, bucketName: target_bucket_name, events: array_of_key/value_events} 
 * @throws {Error}
 */
CustomerManager.prototype.prepareEvents = function(customerData) {
 
  var events = [];
  for (var key in customerData) {
      
    var event = {};
    event = {"key": key, "value": customerData[key], 'iso8601': new Date(customerData.time).toISOString()};
    events.push(event);
  }
  
   return {
    
    bucketId: "c" + customerData.id,
    bucketName: "Customer_" + customerData.id, 
    events: events
  }
};
