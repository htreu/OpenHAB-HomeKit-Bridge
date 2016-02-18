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

import { Switch } from '..';

process.env.NODE_ENV = 'test';

function createSwitch() {
  return new Switch('switchName', 'http://openhab.test/rest/switch', 'ON');
}

describe('SwitchItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let switchElement = createSwitch();
    switchElement.should.have.property('accessory');
    switchElement.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    switchElement.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let switchElement = createSwitch();
    let accessory = switchElement.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('switchName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('switchName');
  });

  it('should have set the initial value', function () {
    let switchElement = createSwitch();
    switchElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/switch/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createSwitch();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let switchElement = createSwitch();

    switchElement.item.updatingFromOpenHAB = true;
    switchElement.item.listener.callback('ON');
    switchElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    switchElement.item.updatingFromOpenHAB.should.be.false;

    switchElement.item.updatingFromOpenHAB = true;
    switchElement.item.listener.callback('OFF');
    switchElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    switchElement.item.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let switchElement = new Switch('switchName', undefined, 'ON');
    switchElement.item.url = 'http://openhab.test/rest/switch';

    nock('http://openhab.test')
      .get('/rest/switch/state?type=json')
      .reply(200, 'ON');

    switchElement.item.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
      done();
    });
  });

});
