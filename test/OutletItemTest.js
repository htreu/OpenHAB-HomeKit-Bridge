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

function createOutlet() {
  return new Switch('outletName', 'http://openhab.test/rest/outlet', 'ON', 'OutletItem');
}

describe('OutletItem', function () {

  it('should contain AccessoryInformation & Outlet services', function () {
    let outletElement = createOutlet();
    outletElement.should.have.property('accessory');
    outletElement.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    outletElement.accessory.getService(Service.Outlet).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let outletElement = createOutlet();
    let accessory = outletElement.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('outletName');
    accessory.getService(Service.Outlet)
      .getCharacteristic(Characteristic.Name).value.should.equal('outletName');
  });

  it('should have set the initial value', function () {
    let outletElement = createOutlet();
    outletElement.accessory.getService(Service.Outlet)
      .getCharacteristic(Characteristic.On).value.should.be.true;
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/outlet/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createOutlet();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let outletElement = createOutlet();

    outletElement.item.updatingFromOpenHAB = true;
    outletElement.item.listener.callback('ON');
    outletElement.accessory.getService(Service.Outlet)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    outletElement.item.updatingFromOpenHAB.should.be.false;

    outletElement.item.updatingFromOpenHAB = true;
    outletElement.item.listener.callback('OFF');
    outletElement.accessory.getService(Service.Outlet)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    outletElement.item.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB value when homekit asks for updates', function(done) {
    let outletElement = new Switch('outletName', undefined, 'ON');
    outletElement.item.url = 'http://openhab.test/rest/outlet';

    nock('http://openhab.test')
      .get('/rest/outlet/state?type=json')
      .reply(200, 'ON');

    outletElement.item.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
      done();
    });
  });

});
