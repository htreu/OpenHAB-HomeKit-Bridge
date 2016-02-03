/**
 * Copyright 2016 Henning Treu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
