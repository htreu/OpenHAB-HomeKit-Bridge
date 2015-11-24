'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class SwitchItem extends OhItem {
  constructor(name, url, state, ohVersion) {
    super(name, url, state, ohVersion);
    this.accessory = this.buildAccessory(state);
    this.updatingFromOpenHAB = false;
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticOnOff = accessory
      .addService(Service.Lightbulb, this.name)
      .getCharacteristic(Characteristic.On);

    charactersiticOnOff.setValue(state === 'ON');

    charactersiticOnOff.on('set', this.updateOpenHabItem.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    return accessory;
  };

  updateCharacteristics(message) {
    this.updatingFromOpenHAB = true;
    this.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On)
        .setValue(message === 'ON' ? true : false,
          function() { // callback to signal us iOS did process the update
            this.updatingFromOpenHAB = false;
          }.bind(this)
        );
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
