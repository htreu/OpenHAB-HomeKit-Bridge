import should from 'should';
import nock from 'nock';
import { Service, Characteristic } from 'hap-nodejs';

import { ColorItem } from '../lib/ColorItem.js';

process.env.NODE_ENV = 'test';

function createColorItem() {
  return new ColorItem('colorItemName', 'http://openhab.test/rest/colorItem', '140,80,30');
}

describe('ColorItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let colorItem = createColorItem();
    colorItem.should.have.property('accessory');
    colorItem.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    colorItem.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let colorItem = createColorItem();
    let accessory = colorItem.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('colorItemName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('colorItemName');
  });

  it('should have set the initial value', function () {
    let colorItem = createColorItem();
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;

    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(140);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(80);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(30);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/colorItem/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createColorItem();
  });

  it('should update characteristics value when listener triggers', function (done) {
    let colorItem = createColorItem();

    colorItem.updatingFromOpenHAB = true;
    colorItem.listener.callback('90,100,0');
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.false;
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(0);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(90);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(100);
    colorItem.updatingFromOpenHAB.should.be.false;

    colorItem.updatingFromOpenHAB = true;
    colorItem.listener.callback('0,100,50');
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(50);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(0);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(100);
    colorItem.updatingFromOpenHAB.should.be.false;

    colorItem.updatingFromOpenHAB = true;
    colorItem.listener.callback('90,0,100');
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(100);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Hue).value.should.be.equal(90);
    colorItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Saturation).value.should.be.equal(0);
    colorItem.updatingFromOpenHAB.should.be.false;
    done();
  });

});
