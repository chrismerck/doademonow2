var log = require("log");
log.setLevel("INFO");

function storeMessage(apsdb, message){
  //Parsing message and saving info in a document with device as a key, each device will have its info saved in a
  // separate document.
  var msg = JSON.parse(message);

  //Dropping milliseconds, because of yyyy-MM-dd'T'HH:mm:ss.SSSZ doesn't accept .SSZ and throws invalid date
  var device_time = msg.data.Time.replace(/\.\d{0,3}\+/, "+");
  var data = {
    "time": new Date(device_time),
    "location": [parseFloat(msg.data.LrrLAT), parseFloat(msg.data.LrrLON), device_time, msg.device],
    "device": msg.device
  };

  var documentKey = buildDocumentKey(msg.device);

  if(data.time instanceof Date) {
    var currentDocumentDate = data.time;  
  } else {
    log.info("No data to store, no valid time provided with device message. "+msg.data.Time); 
    return;
  }


  var fieldName = extractFieldName(currentDocumentDate);
  var documentToSave = {
    "apsdb.store" : "DefaultStore"
  }

  if(currentDocumentDate != null && fieldName != null){
    //start by querying (with lock) for the data document
    var queryParams = {
      "apsdb.query": "apsdb.documentKey = \"" + documentKey + "\"",
      "apsdb.queryFields": "*",
      "apsdb.lock": "true",
      "apsdb.store": "DefaultStore"
    }
    var document = {
      "apsdb.documentKey": documentKey, 
    }			
    var transaction = apsdb.beginTransaction();
    var result = apsdb.callApi("Query", queryParams, {});	
    var document = null;	
    var currentCount = 0;
    if(hasResult(result)){
      document = result.result.documents[0];
      currentCount = document[fieldName] || 0;
    }

    documentToSave[fieldName] = JSON.stringify(data.location);
    documentToSave[fieldName+".apsdb.fieldType"] = "string";

    var tsRegex = /t_[0-9]*/;
    var keys = [];
    if(document != null){
      for(var key in document){
        if (document.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
    }
    documentToSave["apsdb.documentKey"] = documentKey;
    var savedDoc = apsdb.callApi("SaveDocument", documentToSave, {});
    transaction.commit();
  }
}
	
function buildDocumentKey(device){
  //do some escaping and return as is
  return device;
}

function fieldDate(time){
  //date format 
  var date = null;
  var dateFormat = /([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})T([0-9]{1,2}):([0-9]{1,2}):[0-9]{1,2}Z/ ;
  var match = time.match(dateFormat)
  if(match){
    //this is a valid date
    date = new Date(Date.UTC(match[1], match[2] + 1, match[3], match[4], match[5]));
  }
  return date;
}

function extractFieldName(date){
  return "t_" + date.getTime();
}

//given a certain timestamp, calculate all timestamps that fit in the same window
//this will not support the case of an old epoch_time appearing way after its expected timing
function listOfFieldsToKeep(currentDate){
  var fields = [];
  var time = currentDate.getTime();
  //do not return the current one as we need to update this one
  //fields[fields.length] = time;
  for(var i = 1 ; i < windowSize; i++){//replace this by a - 60000 which doesn't require a multiplication
    fields[fields.length] = "t_" + (time - (i * 60000));
  }

  log.info(JSON.stringify(fields));
  return fields;
}

//return true is the query succeeded in retruning one document	
function hasResult(result){
  return result.metadata.status == "success" && result.result.documents.length == 1;	
}
