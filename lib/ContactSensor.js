'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';

class ContactSensor {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);

    this.listener = undefined;
    // listen for OpenHAB updates
    this.registerOpenHABListener();
  }

  registerOpenHABListener() {
    this.listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    this.listener.startListener();
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticContactState = accessory
      .addService(Service.ContactSensor, this.name)
      .getCharacteristic(Characteristic.ContactSensorState);

    charactersiticContactState.setValue(this.convertState(state));
    charactersiticContactState.on('get', this.readOpenHabContact.bind(this));

    return accessory;
  }

  updateCharacteristics(message) {
    let command = this.convertState(message);
    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      console.log("contact sensor value from openHAB: '" + message + "' for " + this.name + ", updating iOS: '" + command + "");
    }
    this.accessory.getService(Service.ContactSensor)
      .getCharacteristic(Characteristic.ContactSensorState)
        .setValue(command);
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
    if ('CLOSED' === state) {
      return Characteristic.ContactSensorState.CONTACT_DETECTED;
    }
    // fall back to 'no contact' if uninitialized or OPEN
    return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
  }
}

export { ContactSensor };
