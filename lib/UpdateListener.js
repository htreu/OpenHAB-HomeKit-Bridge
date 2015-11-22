'use strict';
import WebSocket from 'ws';
import request from 'request';
import EventSource from 'eventsource';

class UpdateListener {
  constructor(url, callback, type = "ws") {
    this.url = url;
    this.callback = callback;
    this.type = type;
  }

  // Only leave one of the startListener uncommented... the default is the websockets one
  // Original WebSockets - works only with OpenHab 1
  startListener() {
    switch (this.type) {
      case "ws":
            startWsListener();
            break;
      case "sse":
            startSseListener();
            break;
      case "poll":
            startPollListener();
            break;
    }
  }

  startWsListener() {
    let _this = this;
    let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for url ' + _this.url);
    });
    ws.on('message', function(message) {
      _this.callback(message);
    });
  }

  // Server Sent Events - works only with OpenHab 2 (this one does not work because in this case listner gets all OpenHAB events not just those for the specific Accessory...)
  startSseListener() {
    let _this = this;
    let es = new EventSource("http://192.168.2.221/rest/events");
    es.onmessage = function(e) {
      console.log(e);
    };

    es.onerror = function() {
      console.log("Error occurred with update listener");
    };
  }

  // Polling - works with both OpenHab 1 and 2, but is inefficient, also seems to have problems with numeric types...
  startPollListener() {
    let _this = this;
    let url = _this.url + '/state?type=json';
    let pollingIntervalMs = 30000;
    function requestCallback(error, response, body) {
      if (error) {
        throw error;
      }
      if (response.statusCode == 200) {
        console.log(url + ": " + body);
        _this.callback(body);
      }
      if (response.statusCode != 200) {
        throw new Error(
            'openHAB Rest interface returned ' + response.statusCode + ' for URL ' + options.url);
      }
    }
    function makeRequest() {
      request(url, requestCallback);
    }
    setInterval(makeRequest, pollingIntervalMs);
  }
}

export { UpdateListener };
