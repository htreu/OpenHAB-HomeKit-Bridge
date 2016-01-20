'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';

class ContactSensor {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);

    // listen for OpenHAB updates
    this.registerOpenHABListener();
  }

  registerOpenHABListener() {
    let listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    listener.startListener();
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticCurrentTemp = accessory
      .addService(Service.ContactSensor, this.name)
      .getCharacteristic(Characteristic.ContactSensorState);

    charactersiticCurrentTemp.setValue(this.convertState(state));
    charactersiticCurrentTemp.on('get', this.readOpenHabContact.bind(this));

    return accessory;
  }

  updateCharacteristics(message) {
    let _this = this;
    console.log('contact received message: ' + message);
    this.accessory.getService(Service.ContacteSensor)
      .getCharacteristic(Characteristic.ContactSensorState)
        .setValue(_this.convertState(message));
  };

  readOpenHabContact(callback) {
    let _this = this;
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(false, _this.convertState(body));
      }
    })
  };

  convertState(state) {
    if ('Uninitialized' === state) {
      return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    }
    // Characteristic.ContactSensorState.CONTACT_DETECTED
    return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
  }
}

export { ContactSensor };
