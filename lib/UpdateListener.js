'use strict';
import WebSocket from 'ws';
import debug from 'debug'; let logger = debug('UpdateListener');

class UpdateListener {
  constructor(url, callback) {
    this.url = url;
    this.callback = callback;
    this.ws = undefined;
  }

  startListener() {
    if (!this.url) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        logger("No URL defined, no listener attached.");
      }
      return;
    }

    this.openConnection();
  }

  registerWebSocketListeners() {
    let _this = this;
    this.ws.on('open', function() {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        debug('open ws connection for url ' + _this.url);
      }
    });

    this.ws.on('message', function(message) {
      _this.callback(message);
    });

    this.ws.on('close', function() {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        debug('ws disconnected for url ' + _this.url);
      }
      _this.reopenConnection();
    });

    this.ws.on('error', function() {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        debug('error connecting to url ' + _this.url);
      }
      _this.reopenConnection();
    });
  }

  reopenConnection() {
    setTimeout(function (updateListener) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        debug('reopen ws connection for url ' + updateListener.url);
      }
      updateListener.openConnection();
    }, 10000, this);
  }

  openConnection() {
    this.ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    this.registerWebSocketListeners();
  }

}

export { UpdateListener };
