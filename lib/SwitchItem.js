import { Accessory, Service, Characteristic, uuid } from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';

'use strict';

class SwitchItem {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);
    // listen for OpenHAB updates
    this.updateCharacteristicsValue();
    this.updatingFromOpenHAB = false;
  }

  buildAccessory(state) {
    let accessory = new Accessory(this.name, uuid.generate(this.name));

    let charactersiticOnOff = accessory
      .addService(Service.Lightbulb, this.name)
      .getCharacteristic(Characteristic.On);

    charactersiticOnOff.value = state === 'ON';

    charactersiticOnOff.on('set', this.updateOpenHabItem.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    return accessory;
  }

  updateCharacteristicsValue() {
    let _this = this;
    let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for switch characteristic.');
    });
    ws.on('message', function(message) {
      _this.updatingFromOpenHAB = true;
      console.log('switch received message: ' + message);
      _this.accessory.getService(Service.Lightbulb)
        .getCharacteristic(Characteristic.On)
          .setValue(message === 'ON' ? true : false,
            function() { // callback to signal us iOS did process the update
              _this.updatingFromOpenHAB = false;
            }.bind(_this)
          );
    });
  };

  readOpenHabPowerState(callback) {
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body === "ON" ? true : false);
      }
    })
  };

  updateOpenHabItem(value, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }
    console.log("received switch value from iOS: " + value);
    let command = value ? 'ON' : 'OFF';
    request.post(
        this.url,
        { body: command },
        function (error, response, body) {
            callback(); // we are done updating the switch item in OpenHAB
        }
    );
  };
}

export { SwitchItem };
