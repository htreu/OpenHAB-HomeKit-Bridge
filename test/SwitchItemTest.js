import should from 'should';
import nock from 'nock';
import { Service, Characteristic } from 'HAP-NodeJS';

import { SwitchItem } from '../lib/SwitchItem.js';

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

});
