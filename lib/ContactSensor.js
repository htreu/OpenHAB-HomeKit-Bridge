'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class ContactSensor extends OhItem {
  constructor(name, url, state, ohVersion) {
    super(name, url, state, ohVersion);
    this.accessory = this.buildAccessory(state);

    // listen for OpenHAB updates
    this.registerOpenHABListener();
  }

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
    console.log('contact received message: ' + message);
    this.accessory.getService(Service.ContacteSensor)
      .getCharacteristic(Characteristic.ContactSensorState)
        .setValue(_this.convertState(message));
  };

  readOpenHabContact(callback) {
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(+body);
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
