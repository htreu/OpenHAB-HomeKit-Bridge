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

import { SwitchItem } from '..';

process.env.NODE_ENV = 'test';

function createSwitchItem() {
  return new SwitchItem('switchItemName', 'http://openhab.test/rest/switchItem', 'ON');
}

describe('SwitchItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let switchItem = createSwitchItem();
    switchItem.should.have.property('accessory');
    switchItem.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    switchItem.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let switchItem = createSwitchItem();
    let accessory = switchItem.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('switchItemName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('switchItemName');
  });

  it('should have set the initial value', function () {
    let switchItem = createSwitchItem();
    switchItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/switchItem/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createSwitchItem();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let switchItem = createSwitchItem();

    switchItem.updatingFromOpenHAB = true;
    switchItem.listener.callback('ON');
    switchItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    switchItem.updatingFromOpenHAB.should.be.false;

    switchItem.updatingFromOpenHAB = true;
    switchItem.listener.callback('OFF');
    switchItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    switchItem.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let switchItem = new SwitchItem('switchItemName', undefined, 'ON');
    switchItem.url = 'http://openhab.test/rest/switchItem';

    nock('http://openhab.test')
      .get('/rest/switchItem/state?type=json')
      .reply(200, 'ON');

    switchItem.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
      done();
    });
  });

});
