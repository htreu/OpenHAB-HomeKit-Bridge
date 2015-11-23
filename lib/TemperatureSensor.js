'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class TemperatureSensor extends OhItem {
  constructor(name, url, state, ohVersion) {
    super(name, url, state, ohVersion);
    this.accessory = this.buildAccessory(state);
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticCurrentTemp = accessory
      .addService(Service.TemperatureSensor, this.name)
      .getCharacteristic(Characteristic.CurrentTemperature);

    charactersiticCurrentTemp.setValue(this.convertState(state));
    charactersiticCurrentTemp.on('get', this.readOpenHabTemperature.bind(this));

    return accessory;
  };

  updateCharacteristics(message) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      console.log('temperature received message: ' + message);
    }
    this.accessory.getService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.CurrentTemperature)
        .setValue(this.convertState(message));
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
    return parseInt(state, 0.0);
  };
}

export { TemperatureSensor };
