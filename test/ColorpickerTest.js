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

import { Colorpicker } from '..';

process.env.NODE_ENV = 'test';

function createColorpicker() {
  return new Colorpicker('colorpickerName', 'http://openhab.test/rest/colorpicker', '140,80,30');
}

describe('Colorpicker', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let colorpicker = createColorpicker();
    colorpicker.should.have.property('accessory');
    colorpicker.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    colorpicker.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let colorpicker = createColorpicker();
    let accessory = colorpicker.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('colorpickerName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('colorpickerName');
  });

  it('should have set the initial value', function () {
    let colorpicker = createColorpicker();
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;

    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(140);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(80);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(30);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/colorpicker/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createColorpicker();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let colorpicker = createColorpicker();

    colorpicker.updatingFromOpenHAB = true;
    colorpicker.listener.callback('90,100,0');
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(0);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(90);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(100);
    colorpicker.updatingFromOpenHAB.should.be.false;

    colorpicker.updatingFromOpenHAB = true;
    colorpicker.listener.callback('0,100,50');
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(50);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(0);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(100);
    colorpicker.updatingFromOpenHAB.should.be.false;

    colorpicker.updatingFromOpenHAB = true;
    colorpicker.listener.callback('90,0,100');
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(100);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(90);
    colorpicker.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(0);
    colorpicker.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB values when homekit asks for updates', function(done) {
    let colorpicker = new Colorpicker('colorpickerName', undefined, '140,80,30');
    colorpicker.url = 'http://openhab.test/rest/colorpicker';

    nock('http://openhab.test')
      .get('/rest/colorpicker/state')
      .times(4)
      .reply(200, '12,8,3');

    colorpicker.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
    });

    colorpicker.readOpenHabBrightnessState(function(err, value) {
      err.should.be.false;
      value.should.be.equal('3');
    });

    colorpicker.readOpenHabHueState(function(err, value) {
      err.should.be.false;
      value.should.be.equal('12');
    });

    colorpicker.readOpenHabSaturationState(function(err, value) {
      err.should.be.false;
      value.should.be.equal('8');
      done();
    });
  });

});
