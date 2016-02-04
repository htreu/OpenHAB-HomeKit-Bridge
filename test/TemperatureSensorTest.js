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

import should from 'should';
import nock from 'nock';
import { Service, Characteristic } from 'hap-nodejs';

import { TemperatureSensor } from '..';

process.env.NODE_ENV = 'test';

function createTemperatureSensor() {
  return new TemperatureSensor('temperatureSensorName', 'http://openhab.test/rest/temperatureSensor', '23.5');
}

describe('TemperatureSensor', function () {

  it('should contain AccessoryInformation & TemperatureSensor services', function () {
    let temperatureSensor = createTemperatureSensor();
    temperatureSensor.should.have.property('accessory');
    temperatureSensor.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    temperatureSensor.accessory.getService(Service.TemperatureSensor).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let temperatureSensor = createTemperatureSensor();
    let accessory = temperatureSensor.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('temperatureSensorName');
    accessory.getService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.Name).value.should.equal('temperatureSensorName');
  });

  it('should have set the initial value', function () {
    let temperatureSensor = createTemperatureSensor();
    temperatureSensor.accessory.getService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.CurrentTemperature).value.should.equal(23.5);
  });

  it('should update its value from openhab', function () {
    let temperatureSensor = createTemperatureSensor();

    temperatureSensor.updateCharacteristics('11.9');

    temperatureSensor.accessory.getService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.CurrentTemperature).value.should.equal(11.9);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/temperatureSensor/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createTemperatureSensor();
  });

  it('should read the openHAB values when homekit asks for updates', function(done) {
    let temperatureSensor = new TemperatureSensor('temperatureSensorName', undefined, '23.5');
    temperatureSensor.url = 'http://openhab.test/rest/temperatureSensor';

    nock('http://openhab.test')
      .get('/rest/temperatureSensor/state?type=json')
      .times(1)
      .reply(200, '32.123');

    temperatureSensor.readOpenHabTemperature(function(err, value) {
      err.should.be.false;
      value.should.be.equal(32.123);
      done();
    });

  });


});
