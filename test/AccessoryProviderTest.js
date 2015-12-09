'use strict';

import should from 'should';
import { AccessoryProvider } from '..';

process.env.NODE_ENV = 'test';


describe('AccessoryProvider', function () {

  let accessoryProvider = new AccessoryProvider();

  it('should process all known items', function(done) {
    let homeKitAccessories = accessoryProvider.createHomeKitAccessories(openHabWidgets());
    homeKitAccessories.should.have.length(5);
    done();
  });

  it('should allow duplicate names for different types', function(done) {
    let homeKitAccessories = accessoryProvider.createHomeKitAccessories(duplicateNamesWidgets());

    homeKitAccessories.forEach(function(original) {
      homeKitAccessories.forEach(function(accessory) {
        if (original === accessory) {
          return true;
        }
        original.UUID.should.not.equal(accessory.UUID);
      });
    });

    done();
  });

});

function openHabWidgets() {
  return [
    { type:'SwitchItem', name:'switch', link:'http://openhab.test', state:'ON' },
    { type:'DimmerItem', name:'dimmer', link:'http://openhab.test', state:'50' },
    { type:'ColorItem', name:'color', link:'http://openhab.test', state:'10,100,100' },
    { type:'RollershutterItem', name:'rollershutter', link:'http://openhab.test', state:'80' },
    { type:'NumberItem', name:'temperature', link:'http://openhab.test', state:'22.5' },

    // Unknown
    { type:'ContactSensor', name:'contact', link:'http://openhab.test', state:'OPEN' }
  ];
};

function duplicateNamesWidgets() {
  return [
    { type:'SwitchItem',        name:'itemName', link:'http://openhab.test', state:'ON' },
    { type:'DimmerItem',        name:'itemName', link:'http://openhab.test', state:'50' },
    { type:'ColorItem',         name:'itemName', link:'http://openhab.test', state:'10,100,100' },
    { type:'RollershutterItem', name:'itemName', link:'http://openhab.test', state:'80' },
    { type:'NumberItem',        name:'itemName', link:'http://openhab.test', state:'22.5' }
  ];
};
