var eventManagement = require("iotx/eventManagement");

/**
 * This class knows how to parse device specific messages
 * @DeviceManager
 * @extends EventManager
 * @constructor
 */
function DeviceManager() {
}

DeviceManager.prototype = new eventManagement.EventManager();
DeviceManager.prototype.constructor = DeviceManager;

/** 
 * Parse the received msg to retrieve the required data
 * @method parse
 * @param {Object} [msg] : the message to parse
 * @return {Object} a new data structure only containing relevant information
 * @throws {Error}
 */
DeviceManager.prototype.parse = function(msg) {  
 
  var msgClone = JSON.parse(JSON.stringify(msg));
  var deviceData = {      
     id: msgClone.device      
  }
  
  for (var key in msgClone.data) {
  
    if (key != "CustomerData") {
    	deviceData[key] = msgClone.data[key];
    }
  }
 
  if (deviceData.Lrrs) {
    
    deviceData["LrrESP"] = deviceData.Lrrs.Lrr.LrrESP;
    delete deviceData.Lrrs;
  } 
 
  return deviceData;
};

/** 
 * Transform parse data into a collection of events meant to be sent to the analytics service
 * @method prepareEvents
 * @param {Object} [data] : the parsed data
 * @return {Object} {bucketId: target_bucket_id, bucketName: target_bucket_name, events: array_of_key/value_events} 
 * @throws {Error}
 */
DeviceManager.prototype.prepareEvents = function(deviceData) {
 
  var events = [];
  var exclusionList = ["id", "Time", "xmlns"];
  for (var key in deviceData) {
      
    var event = {};
    if (exclusionList.indexOf(key) == -1) {
    
      event = {"key": key, "value": deviceData[key], 'iso8601': new Date().toISOString()};
      events.push(event);
    }
  }
  
  return {
    
    bucketId: "device_" + deviceData.id,
    bucketName: "Device_" + deviceData.id,
    events: events
  }
};
