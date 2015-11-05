'use strict';
import WebSocket from 'ws';
import request from 'request';

class UpdateListener {
  constructor(url, callback) {
    this.url = url;
    this.callback = callback;
  }

  //startListener() {
  //  let _this = this;
  //  let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
  //  ws.on('open', function() {
  //    console.log('open ws connection for url ' + _this.url);
  //  });
  //  ws.on('message', function(message) {
  //    _this.callback(message);
  //  });
  //}
  startListener() {
    let _this = this;
    let url = this.url + '/state?type=json';

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

    setInterval(makeRequest, 30000);
  }

}

export { UpdateListener };
