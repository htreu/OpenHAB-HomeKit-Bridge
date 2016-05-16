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

import { Slider } from '..';

process.env.NODE_ENV = 'test';

function createSlider() {
  return new Slider('sliderName', 'http://openhab.test/rest/slider', '80');
}

describe('Slider', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let slider = createSlider();
    slider.should.have.property('accessory');
    slider.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    slider.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let slider = createSlider();
    let accessory = slider.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('sliderName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('sliderName');
  });

  it('should have set the initial value', function () {
    let slider = createSlider();
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;

    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(80);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/slider/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createSlider();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let slider = createSlider();

    slider.updatingFromOpenHAB = true;
    slider.listener.callback('0');
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(0);
    slider.updatingFromOpenHAB.should.be.false;

    slider.updatingFromOpenHAB = true;
    slider.listener.callback('50');
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(50);
    slider.updatingFromOpenHAB.should.be.false;

    slider.updatingFromOpenHAB = true;
    slider.listener.callback('100');
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    slider.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(100);
    slider.updatingFromOpenHAB.should.be.false;
    done();
  });

  it('should read the openHAB values when homekit asks for updates', function(done) {
    let slider = new Slider('sliderName', undefined, '80');
    slider.url = 'http://openhab.test/rest/slider';

    nock('http://openhab.test')
      .get('/rest/slider/state?type=json')
      .times(2)
      .reply(200, '12');

    slider.readOpenHabPowerState(function(err, value) {
      err.should.be.false;
      value.should.be.true;
    });

    slider.readOpenHabBrightnessState(function(err, value) {
      err.should.be.false;
      value.should.equal(12);
      done();
    });
  });

});
