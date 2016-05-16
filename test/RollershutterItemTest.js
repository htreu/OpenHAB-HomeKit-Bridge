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

function createRollershutterSwitch() {
  return new Switch(
    'rollershutterSwitchName',
    'http://openhab.test/rest/rollershutterSwitch',
    '80',
    'RollershutterItem');
}

describe('RollershutterItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let rollershutterSwitch = createRollershutterSwitch();
    rollershutterSwitch.should.have.property('accessory');
    rollershutterSwitch.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    rollershutterSwitch.accessory.getService(Service.WindowCovering).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let rollershutterSwitch = createRollershutterSwitch();
    let accessory = rollershutterSwitch.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('rollershutterSwitchName');
    accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.Name).value.should.equal('rollershutterSwitchName');
  });

  it('should have set the initial value', function () {
    let rollershutterSwitch = createRollershutterSwitch();
    rollershutterSwitch.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(20);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/rollershutterSwitch/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createRollershutterSwitch();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let rollershutterSwitch = createRollershutterSwitch();

    rollershutterSwitch.item.updatingFromOpenHAB = true;
    rollershutterSwitch.item.listener.callback('100');
    rollershutterSwitch.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(0);
    rollershutterSwitch.item.updatingFromOpenHAB.should.be.false;

    rollershutterSwitch.item.updatingFromOpenHAB = true;
    rollershutterSwitch.item.listener.callback('10');
    rollershutterSwitch.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(90);
    rollershutterSwitch.item.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let rollershutterSwitch = new Switch('rollershutterSwitchName', undefined, '60', 'RollershutterItem');
    rollershutterSwitch.item.url = 'http://openhab.test/rest/rollershutterSwitch';

    nock('http://openhab.test')
      .get('/rest/rollershutterSwitch/state?type=json')
      .reply(200, '50');

    rollershutterSwitch.item.readOpenHabCurrentPosition(function(err, value) {
      err.should.be.false;
      value.should.equal(50);
      done();
    });
  });

  it('should send command to openHAB when homekit sends updates', function(done) {
    let rollershutterSwitch = new Switch('rollershutterSwitchName', undefined, '60', 'RollershutterItem');
    rollershutterSwitch.item.url = 'http://openhab.test/rest/rollershutterSwitch';

    nock('http://openhab.test')
      .post('/rest/rollershutterSwitch', '30')
      .reply(200);

    rollershutterSwitch.item.updateOpenHabItem(70, function() {
      done();
    });

  });

});
