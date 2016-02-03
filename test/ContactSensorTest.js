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

import should from 'should';
import nock from 'nock';
import { Service, Characteristic } from 'hap-nodejs';

import { ContactSensor } from '..';

process.env.NODE_ENV = 'test';

function createContactSensor() {
  return new ContactSensor('contactSensorName', 'http://openhab.test/rest/contactSensor', 'OPEN');
}

describe('ContactSensor', function () {

  it('should contain AccessoryInformation & ContactSensor services', function () {
    let contactSensor = createContactSensor();
    contactSensor.should.have.property('accessory');
    contactSensor.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    contactSensor.accessory.getService(Service.ContactSensor).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let contactSensor = createContactSensor();
    let accessory = contactSensor.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('contactSensorName');
    accessory.getService(Service.ContactSensor)
      .getCharacteristic(Characteristic.Name).value.should.equal('contactSensorName');
  });

  it('should have set the initial value', function () {
    let contactSensor = createContactSensor();
    contactSensor.accessory.getService(Service.ContactSensor)
      .getCharacteristic(Characteristic.ContactSensorState).value.should.equal(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/contactSensor/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createContactSensor();
  });

  it('should update characteristics value when listener triggers', function () {
    let contactSensor = createContactSensor();
    contactSensor.listener.callback('CLOSED');

    contactSensor.accessory.getService(Service.ContactSensor)
      .getCharacteristic(Characteristic.ContactSensorState).value.should
        .equal(Characteristic.ContactSensorState.CONTACT_DETECTED);

    contactSensor.listener.callback('OPEN');

    contactSensor.accessory.getService(Service.ContactSensor)
      .getCharacteristic(Characteristic.ContactSensorState).value.should
        .equal(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let contactSensor = new ContactSensor('contactSensorName', undefined, 'OPEN');
    contactSensor.url = 'http://openhab.test/rest/contactSensor';

    nock('http://openhab.test')
      .get('/rest/contactSensor/state?type=json')
      .reply(200, 'Undefined');

    contactSensor.readOpenHabContact(function(err, value) {
      err.should.be.false;
      value.should.be.equal(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    });

    nock('http://openhab.test')
      .get('/rest/contactSensor/state?type=json')
      .reply(200, 'CLOSED');

    contactSensor.readOpenHabContact(function(err, value) {
      err.should.be.false;
      value.should.be.equal(Characteristic.ContactSensorState.CONTACT_DETECTED);
      done();
    });
  });

});
