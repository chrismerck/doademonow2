/**
 * API that receives data to be transformed and streamed into an analytics service
 * Data can be sent through Web Sockets or HTTP. Expected parameter name is "msg"
 * The received msg is parsed using an instance of DeviceManager to extract/transform/load device data
 * the the message is parsed using an instance of CustomerManager to extract/transform/load customer data
 * @module ingest
 * @param {Object} msg: device data
 * @return {String} "success" of {Object} error {errorCode, errorDetail}
 */

var deviceManagement =  require("iotx/deviceManagement");
var customerManagement = require("iotx/customerManagement");
var storeDeviceGeoData =  require("iotx/geoDataStore");
try {

  var msgStr = request.parameters.msg ? request.parameters.msg : request.rawBody;
  var msg = JSON.parse(msgStr);
  if (msg) {
    
    var deviceManager = new deviceManagement.DeviceManager();
    deviceManager.ingest(msg);
    var customerManager = new customerManagement.CustomerManager();
    customerManager.ingest(msg);
    storeDeviceGeoData.storeMessage(apsdb, JSON.stringify(msg));
    return "success";
  }

  return {

    error: "Invalid_Message",
    errorDetai: msg + " is not a valid message"
  };
} catch (exception) {
    return exception;
}
