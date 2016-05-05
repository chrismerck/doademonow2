function getGeoData(device) {
  var documentKey = device;
  var queryParams = {
    "apsdb.query": "apsdb.documentKey = \"" + documentKey + "\"",
    "apsdb.queryFields": "*",
    "apsdb.lock": "false",
    "apsdb.store": "DefaultStore"
  }
 
  var result = apsdb.callApi("Query", queryParams, {});	
  var document = null;	
  var tsRegex = /t_[0-9]*/;
  if(hasResult(result)){
    document = result.result.documents[0];
    var data = [["Latitude", "Longitude", "Device", "Time"]];
    var keys = [], k, i, len;
    for(var key in document){
        if(key.match(tsRegex)) {
        	keys.push(key);
        }
    }
    //Sorting by date
    keys.sort(function(a, b){
      return parseInt(a.substring(2, a.length))-parseInt(b.substring(2, b.length))
    });
    len = keys.length;
    for (i = 0; i < len; i++) {
        k = keys[i];
        data.push(JSON.parse(document[k]));
    }
	return data;
  } else {
        return [];
  }
 
}

function hasResult(result){
    return result.metadata.status == "success" && result.result.documents.length == 1;	
}

return getGeoData(request.parameters.device);
