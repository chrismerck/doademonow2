/*
 * iotx_test.js -- Receives Packets from LoRaWAN Nodes via IoT-X
 * Author: Chris Merck
 * May 2016
 */

/* 
   First we define some utility functions for converting between Base64 and Hex
   Thanks to @coder hacker on StackOverflow
   http://stackoverflow.com/a/23190164/1908146
 */
var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var table = tableStr.split("");
atob = function (base64) {
  if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
  base64 = base64.replace(/=/g, "");
  var n = base64.length & 3;
  if (n === 1) throw new Error("String contains an invalid character");
  for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
    var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
    var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
    if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
    bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
    bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
    bin[bin.length] = ((c << 6) | d) & 255;
  };
  return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
};
btoa = function (bin) {
  for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
    var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
    if ((a | b | c) > 255) throw new Error("String contains an invalid character");
    base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
      (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
      (isNaN(b + c) ? "=" : table[c & 63]);
  }
  return base64.join("");
};
function hexToBase64(str) {
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}
function base64ToHex(str) {
  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
    var tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join(" ");
}

/*
  Packet decode from LoRaMOTE:
 */
function moteDecode(hex) {
  /* hex is hexidecimal decode of packet from LoRaMOTE, such as "00 19 03 fd"
     return value is JSON obj with decoded data */  
  temp = parseInt(hex.slice(0,2),16)*256 + parseInt(hex.slice(0+3,2+3),16);
  light = parseInt(hex.slice(0+3*2,2+3*2),16)*256 + parseInt(hex.slice(0+3*3,2+3*3),16);
  return {"temp":temp, "light":light};
}


/*
 Setup the InitialState connector
 */

var c = require('initialstate/initialstateclient');
var isc = new c.InitialState();


/*
   Next we handle the incomming packet from TheThingsNetwork,
*/


// Parse MQTT packet from TheThingsNetwork
ws_pkt = JSON.parse(request.parameters.msg);

// got node data packet
// decode the base64 data field
ws_pkt.data_ascii = base64ToHex(ws_pkt.data.data);
  
// decode payload
pkt_data_obj = moteDecode(ws_pkt.data_ascii);  
ws_pkt.pkt_data_obj = pkt_data_obj;
serNo = {"abcd0001":1, "abcd0002":2, "abcd0003":3}[ws_pkt.data.DevAddr];

// push to initial state
isc.sendEvents({
  "bucketKey":"422",
  "events":[
    {"key":serNo+"_temp","value":pkt_data_obj.temp},
    {"key":serNo+"_light","value":Math.round(pkt_data_obj.light/11)}
  ]});

return ws_pkt;
