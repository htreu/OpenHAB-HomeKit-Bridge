import should from 'should';
import nock from 'nock';
import {Service, Characteristic} from 'HAP-NodeJS';

import { SwitchItem } from '../lib/SwitchItem.js';

process.env.NODE_ENV = 'test';

function createSwitchItem() {
  return new SwitchItem('switchItemName', 'http://openhab.test/switchItem', '1');
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

});
