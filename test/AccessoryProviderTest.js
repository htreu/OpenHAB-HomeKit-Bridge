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
