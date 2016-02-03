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
import request from 'request';
import EventSource from 'eventsource';

class UpdateListener {
  constructor(url, callback) {
    this.url = url;
    this.callback = callback;
  }

  //starts a WebSockets listener - works with OpenHab 1
  startListener() {
    let _this = this;
    let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for url ' + _this.url);
    });
    ws.on('message', function(message) {
      _this.callback(message);
    });
  }

  // Server Sent Events - works only with OpenHab 2
  static startSseListener(url) {
    if (!UpdateListener.subscribers) {
      UpdateListener.subscribers = {};
    }

    console.log("Starting Server Side Events (SSE) listener for OpenHab 2");
    console.log(url);
    let es = new EventSource(url);
    es.onmessage = UpdateListener.sseEventHandler;

    es.onerror = function() {
      console.log("Error occurred with update listener. Restarting listener in 30 seconds.");
      es.close();
      setTimeout(function() {
        UpdateListener.startSseListener(url);
      }, 30000);
    };
  }

  static addSseSubscriber(itemName, callback) {
    if (!UpdateListener.subscribers) {
      UpdateListener.subscribers = {};
    }

    console.info(itemName + " subscribing for state updates")
    UpdateListener.subscribers[itemName] = callback;
  }

  static sseEventHandler(event) {
    if (event.type == "message") {//not sure if this check needed
      let data = JSON.parse(event.data);

      if (data.type == 'ItemStateChangedEvent') {//make sure this is a state change
        let item = data.topic.split("/")[2];
        if (UpdateListener.subscribers[item] != undefined) {
          let payload = JSON.parse(data.payload);
          UpdateListener.subscribers[item](payload.value);
        }
      }
    }
  }
}

export { UpdateListener };
