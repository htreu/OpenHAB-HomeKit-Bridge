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
import { CustomServices, CustomCharacteristics } from '..';

import { Text } from '..';

process.env.NODE_ENV = 'test';

function createGenericText() {
  return new Text('Text Value [Generic Text]', 'http://openhab.test/rest/textName', 'Generic');
}

function createTemperatureText() {
  return new Text('Temperature [22 C]', 'http://openhab.test/rest/temperatureName', '23.5', 'NumberItem');
}

function createContactSensorText() {
  return new Text('Door [OPEN]', 'http://openhab.test/rest/contactSensorName', 'OPEN', 'ContactItem');
}

describe('Text', function () {
  
  describe('with generic string value', function () {
    
    it('should contain AccessoryInformation & TextInfo services', function () {
      let textElement = createGenericText();
      textElement.should.have.property('accessory');
      textElement.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
      textElement.accessory.getService(CustomServices.TextInfoService).should.not.be.empty;
    });

    it('should have set the correct name', function () {
      let textElement = createGenericText();
      let accessory = textElement.accessory;
      accessory.getService(Service.AccessoryInformation)
        .getCharacteristic(Characteristic.Name).value.should.equal('Text Value');
      accessory.getService(CustomServices.TextInfoService)
        .getCharacteristic(Characteristic.Name).value.should.equal('Text Value');
    });

    it('should have set the initial value', function () {
      let textElement = createGenericText();
      textElement.accessory.getService(CustomServices.TextInfoService)
        .getCharacteristic(CustomCharacteristics.TextInfoCharacteristic).value.should.equal('Generic Text');
    });

    it('should update its value from openhab', function (done) {
      let textElement = createGenericText();
      let widgetJSON = JSON.stringify({
        label: 'Text Value [Updated Text]',
        type: 'Text',
        item: {
          link: 'http://openhab.test/rest/textName'
        }
      });
      
      nock('http://openhab.test')
        .get('/rest/sitemaps/test.sitemap?type=json')
        .reply(200, '{ "homepage" : { "widget" : [ ' + widgetJSON + ' ] } }');

      textElement.updateCharacteristics('11.9', function () {
        textElement.accessory.getService(CustomServices.TextInfoService)
          .getCharacteristic(CustomCharacteristics.TextInfoCharacteristic).value.should.equal('Updated Text');
        done();
      });

    });
    
    it('should read the openHAB values when homekit asks for updates', function(done) {
      let textElement = new Text('Text Value [Generic Text]', 'http://openhab.test/rest/textName', 'Generic');

      let widgetJSON = JSON.stringify({
        label: 'Text Value [New Text Value]',
        type: 'Text',
        item: {
          link: 'http://openhab.test/rest/textName'
        }
      });
      
      nock('http://openhab.test')
        .get('/rest/sitemaps/test.sitemap?type=json')
        .reply(200, '{ "homepage" : { "widget" : [ ' + widgetJSON + ' ] } }');

      textElement.readOpenHabText(function(err, value) {
        err.should.be.false;
        value.should.be.equal('New Text Value');
        done();
      });

    });
    
  });
  
  
  describe('with temperature', function () {
    
    it('should contain AccessoryInformation & TemperatureSensor services', function () {
      let textElement = createTemperatureText();
      textElement.should.have.property('accessory');
      textElement.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
      textElement.accessory.getService(Service.TemperatureSensor).should.not.be.empty;
    });

    it('should have set the correct name', function () {
      let textElement = createTemperatureText();
      let accessory = textElement.accessory;
      accessory.getService(Service.AccessoryInformation)
        .getCharacteristic(Characteristic.Name).value.should.equal('Temperature');
      accessory.getService(Service.TemperatureSensor)
        .getCharacteristic(Characteristic.Name).value.should.equal('Temperature');
    });

    it('should have set the initial value', function () {
      let textElement = createTemperatureText();
      textElement.accessory.getService(Service.TemperatureSensor)
        .getCharacteristic(Characteristic.CurrentTemperature).value.should.equal(23.5);
    });

    it('should update its value from openhab', function () {
      let textElement = createTemperatureText();

      textElement.updateCharacteristics('11.9');

      textElement.accessory.getService(Service.TemperatureSensor)
        .getCharacteristic(Characteristic.CurrentTemperature).value.should.equal(11.9);
    });

    it('should make web socket connection to OpenHAB', function (done) {
      nock('http://openhab.test')
        .get('/rest/temperatureName/state?type=json')
        .reply(200, function(uri, requestBody) {
          done();
        });
      createTemperatureText();
    });

    it('should read the openHAB values when homekit asks for updates', function(done) {
      let textElement = new Text('Temperature [22 C]', undefined, '23.5', 'NumberItem');
      textElement.url = 'http://openhab.test/rest/temperatureName';

      nock('http://openhab.test')
        .get('/rest/temperatureName/state?type=json')
        .times(1)
        .reply(200, '32.123');

      textElement.readOpenHabText(function(err, value) {
        err.should.be.false;
        value.should.be.equal(32.123);
        done();
      });

    });
    
  });
  

  describe('with contact sensor', function () {

    it('should contain AccessoryInformation & ContactSensor services', function () {
      let contactSensor = createContactSensorText();
      contactSensor.should.have.property('accessory');
      contactSensor.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
      contactSensor.accessory.getService(Service.ContactSensor).should.not.be.empty;
    });

    it('should have set the correct name', function () {
      let contactSensor = createContactSensorText();
      let accessory = contactSensor.accessory;
      accessory.getService(Service.AccessoryInformation)
        .getCharacteristic(Characteristic.Name).value.should.equal('Door');
      accessory.getService(Service.ContactSensor)
        .getCharacteristic(Characteristic.Name).value.should.equal('Door');
    });

    it('should have set the initial value', function () {
      let contactSensor = createContactSensorText();
      contactSensor.accessory.getService(Service.ContactSensor)
        .getCharacteristic(Characteristic.ContactSensorState).value.should
          .equal(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    });

    it('should make web socket connection to OpenHAB', function (done) {
      nock('http://openhab.test')
        .get('/rest/contactSensorName/state?type=json')
        .reply(200, function(uri, requestBody) {
          done();
        });
      createContactSensorText();
    });

    it('should update characteristics value when listener triggers', function () {
      let contactSensor = createContactSensorText();
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
      let contactSensor = new Text('Door [OPEN]', undefined, 'OPEN', 'ContactItem');
      contactSensor.url = 'http://openhab.test/rest/contactSensorName';

      nock('http://openhab.test')
        .get('/rest/contactSensorName/state?type=json')
        .reply(200, 'Undefined');

      contactSensor.readOpenHabText(function(err, value) {
        err.should.be.false;
        value.should.be.equal(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
      });

      nock('http://openhab.test')
        .get('/rest/contactSensorName/state?type=json')
        .reply(200, 'CLOSED');

      contactSensor.readOpenHabText(function(err, value) {
        err.should.be.false;
        value.should.be.equal(Characteristic.ContactSensorState.CONTACT_DETECTED);
        done();
      });
    });

  });
  


});
