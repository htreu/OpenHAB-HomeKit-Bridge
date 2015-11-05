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
    let options = {
                   headers: {
                     'X-Atmosphere-Transport': 'long-polling',
                     'X-Atmosphere-Framework' : '1.0',
                     'Accept' : 'application/json'
                    },
                    url: this.url + '?type=json'
                   }
    console.log(options);

    function requestCallback(error, response, body) {
      console.log("requestCallback");
      if (error) {
        throw error;
      }
      console.log(response);
      if (response.statusCode == 200) {
        console.log(body);
        this.callback(body);
        makeRequest();
      }
      if (response.statusCode != 200) {
        throw new Error(
            'openHAB Rest interface returned ' + response.statusCode + ' for URL ' + options.url);
      }
    }

    function makeRequest() {
      console.log("makeRequest");
      request(options, requestCallback);
    }

    makeRequest();
  }

}

export { UpdateListener };
