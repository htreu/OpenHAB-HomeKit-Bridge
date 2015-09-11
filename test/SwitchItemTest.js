import should from 'should';
import HAPNodeJS from 'HAP-NodeJS';

import { SwitchItem } from '../lib/SwitchItem.js';

process.env.NODE_ENV = 'test';

function createSwitchItem() {
  return new SwitchItem('switchItemName', 'http://openhab.test/switchItem', '1');
}

describe('SwitchItem', function () {

  it('should contain AccessoryInformation & Lightbulb services', function () {
    let switchItem = createSwitchItem();
    switchItem.should.have.property('accessory');
    switchItem.accessory.getService(HAPNodeJS.Service.AccessoryInformation)
      .should.not.be.empty;
    switchItem.accessory.getService(HAPNodeJS.Service.Lightbulb)
      .should.not.be.empty;
  });

  it('should have set the correct name', function () {
    let switchItem = createSwitchItem();
    let accessory = switchItem.accessory;
    accessory.getService(HAPNodeJS.Service.AccessoryInformation)
    .getCharacteristic(HAPNodeJS.Characteristic.Name).value.should.equal('switchItemName');
    accessory.getService(HAPNodeJS.Service.Lightbulb)
    .getCharacteristic(HAPNodeJS.Characteristic.Name).value.should.equal('switchItemName');
  });

});
