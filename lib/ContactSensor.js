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

import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import debug from 'debug'; let logger = debug('ContactSensor');

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
      logger("contact sensor value from openHAB: '" + message + "' for " + this.name + ", updating iOS: '" + command + "");
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
