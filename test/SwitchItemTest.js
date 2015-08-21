import should from 'should';
import Types from 'HAP-NodeJS';
let types = Types.types;
import { SwitchItem } from '../lib/SwitchItem.js';

process.env.NODE_ENV = 'test';

function createSwitchItem() {
  return new SwitchItem('switchItemName', '1', 'http://openhab.test/switchItem/state');
}

describe('SwitchItem', function () {

  it('should contain two services', function () {
    let switchItem = createSwitchItem();
    switchItem.should.have.property('services');
    switchItem.services.should.have.length(2);
  });

  it('should contain AccessoryInformationService', function () {
    let switchItem = createSwitchItem();
    switchItem.services[0].sType.should.equal(types.ACCESSORY_INFORMATION_STYPE);
  });

});
