'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class HumiditySensor extends OhItem {
  constructor(name, itemName, url, state, ohVersion) {
    super(name, itemName, url, state, ohVersion);
    this.accessory = this.buildAccessory(state);
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticCurrentHumidity = accessory
      .addService(Service.HumiditySensor, this.name)
      .getCharacteristic(Characteristic.CurrentRelativeHumidity);

    charactersiticCurrentHumidity.setValue(this.convertState(state));
    charactersiticCurrentHumidity.on('get', this.readOpenHabHumidity.bind(this));

    return accessory;
  };

  updateCharacteristics(message) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      console.log('humidity received message: ' + message);
    }
    this.accessory.getService(Service.HumiditySensor)
      .getCharacteristic(Characteristic.CurrentTemperature)
        .setValue(this.convertState(message));
  };

  readOpenHabHumidity(callback) {
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
  };
}

export { HumiditySensor };
