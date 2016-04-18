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
  return new Switch('lightbulbName', 'http://openhab.test/rest/lightbulb', 'ON');
}

describe('LightbulbItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let lightbulbElement = createSwitch();
    lightbulbElement.should.have.property('accessory');
    lightbulbElement.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    lightbulbElement.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let lightbulbElement = createSwitch();
    let accessory = lightbulbElement.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('lightbulbName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('lightbulbName');
  });

  it('should have set the initial value', function () {
    let lightbulbElement = createSwitch();
    lightbulbElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/lightbulb/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createSwitch();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let lightbulbElement = createSwitch();

    lightbulbElement.item.updatingFromOpenHAB = true;
    lightbulbElement.item.listener.callback('ON');
    lightbulbElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    lightbulbElement.item.updatingFromOpenHAB.should.be.false;

    lightbulbElement.item.updatingFromOpenHAB = true;
    lightbulbElement.item.listener.callback('OFF');
    lightbulbElement.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    lightbulbElement.item.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let lightbulbElement = new Switch('lightbulbName', undefined, 'ON');
    lightbulbElement.item.url = 'http://openhab.test/rest/lightbulb';

    nock('http://openhab.test')
      .get('/rest/lightbulb/state?type=json')
      .reply(200, 'ON');

    lightbulbElement.item.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
      done();
    });
  });

  it('should update the openHAB value when homekit has new value', function(done) {
    let lightbulbElement = new Switch('lightbulbName', undefined, 'OFF');
    lightbulbElement.item.url = 'http://openhab.test/rest/lightbulb';

    nock('http://openhab.test')
      .post('/rest/lightbulb', 'ON')
      .reply(200, '');

    lightbulbElement.item.updateOpenHabItem(true, function() {
      done();
    });
  });


});
