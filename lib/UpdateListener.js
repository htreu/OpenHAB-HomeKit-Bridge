'use strict';
import WebSocket from 'ws';

class UpdateListener {
  constructor(url, callback) {
    this.url = url;
    this.callback = callback;
  }

  startListener() {
    if (!this.url) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        console.log("No URL defined, no listener attached.");
      }
      return;
    }
    let _this = this;
    let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for url ' + _this.url);
    });
    ws.on('message', function(message) {
      _this.callback(message);
    });
  }

}

export { UpdateListener };
