import should from 'should';
import nock from 'nock';
import { Service, Characteristic } from 'HAP-NodeJS';

import { DimmerItem } from '../lib/DimmerItem.js';

process.env.NODE_ENV = 'test';

function createDimmerItem() {
  return new DimmerItem('dimmerItemName', 'http://openhab.test/rest/dimmerItem', '80');
}

describe('DimmerItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let dimmerItem = createDimmerItem();
    dimmerItem.should.have.property('accessory');
    dimmerItem.accessory.getService(Service.AccessoryInformation).should.not.be.empty;
    dimmerItem.accessory.getService(Service.Lightbulb).should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let dimmerItem = createDimmerItem();
    let accessory = dimmerItem.accessory;
    accessory.getService(Service.AccessoryInformation)
      .getCharacteristic(Characteristic.Name).value.should.equal('dimmerItemName');
    accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Name).value.should.equal('dimmerItemName');
  });

  it('should have set the initial value', function () {
    let dimmerItem = createDimmerItem();
    dimmerItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On).value.should.be.true;

    dimmerItem.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.Brightness).value.should.be.equal(80);
  });

  it('should make web socket connection to OpenHAB', function (done) {
    nock('http://openhab.test')
      .get('/rest/dimmerItem/state?type=json')
      .reply(200, function(uri, requestBody) {
        done();
      });
    createDimmerItem();
  });

});
