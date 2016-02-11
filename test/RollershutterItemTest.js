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

import { RollershutterItem } from '..';

process.env.NODE_ENV = 'test';

function createRollershutterItem() {
  return new RollershutterItem('rollershutterItemName', 'http://openhab.test/rest/rollershutterItem', '80');
}

describe('RollershutterItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let rollershutterItem = createRollershutterItem();
    rollershutterItem.should.have.property('accessory');
    rollershutterItem.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    rollershutterItem.accessory.getService(Service.WindowCovering).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let rollershutterItem = createRollershutterItem();
    let accessory = rollershutterItem.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('rollershutterItemName');
    accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.Name).value.should.equal('rollershutterItemName');
  });

  it('should have set the initial value', function () {
    let rollershutterItem = createRollershutterItem();
    rollershutterItem.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(80);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/rollershutterItem/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createRollershutterItem();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let rollershutterItem = createRollershutterItem();

    rollershutterItem.updatingFromOpenHAB = true;
    rollershutterItem.listener.callback('100');
    rollershutterItem.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(100);
    rollershutterItem.updatingFromOpenHAB.should.be.false;

    rollershutterItem.updatingFromOpenHAB = true;
    rollershutterItem.listener.callback('10');
    rollershutterItem.accessory.getService(Service.WindowCovering)
      .getCharacteristic(Characteristic.CurrentPosition).value.should.equal(10);
    rollershutterItem.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let rollershutterItem = new RollershutterItem('rollershutterItemName', undefined, '60');
    rollershutterItem.url = 'http://openhab.test/rest/rollershutterItem';

    nock('http://openhab.test')
      .get('/rest/rollershutterItem/state?type=json')
      .reply(200, '50');

    rollershutterItem.readOpenHabCurrentPosition(function(err, value) {
      err.should.be.false;
      value.should.equal(50);
      done();
    });
  });

  it('should send command to openHAB when homekit sends updates', function(done) {
    let rollershutterItem = new RollershutterItem('rollershutterItemName', undefined, '60');
    rollershutterItem.url = 'http://openhab.test/rest/rollershutterItem';

    nock('http://openhab.test')
      .post('/rest/rollershutterItem', '100')
      .reply(200);

    rollershutterItem.updateOpenHabItem(100, function() {
      done();
    });

  });

});
