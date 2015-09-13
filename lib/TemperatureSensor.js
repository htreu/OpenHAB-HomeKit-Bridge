import { Accessory, Service, Characteristic, uuid } from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';

'use strict';

class TemperatureSensor {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);
    // listen for OpenHAB updates
    this.updateCharacteristicsValue();
  }

  buildAccessory(state) {
    let accessory = new Accessory(this.name, uuid.generate(this.name));

    let charactersiticCurrentTemp = accessory
      .addService(Service.TemperatureSensor, this.name)
      .getCharacteristic(Characteristic.CurrentTemperature);

    charactersiticCurrentTemp.setValue(this.convertState(state));
    charactersiticCurrentTemp.on('get', this.readOpenHabTemperature.bind(this));

    return accessory;
  }

  updateCharacteristicsValue() {
    let _this = this;
    let ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for temperature characteristic.');
    });
    ws.on('message', function(message) {
      console.log('temperature received message: ' + message);
      _this.accessory.getService(Service.TemperatureSensor)
        .getCharacteristic(Characteristic.CurrentTemperature)
          .setValue(_this.convertState(message));
    });
  };

  readOpenHabTemperature(callback) {
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(+body);
      }
    })
  };

  convertState(state) {
    if ('Uninitialized' === state) {
      return 0.0;
    }

    return +state;
  }
}

export { TemperatureSensor };
