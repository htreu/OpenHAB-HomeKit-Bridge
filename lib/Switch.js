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

import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import { SwitchItem } from './subtypes/SwitchItem.js';
import { RollershutterItem } from './subtypes/RollershutterItem.js';
import request from 'request';
import debug from 'debug'; let logger = debug('Switch');

import { UpdateListener } from './UpdateListener.js';

class Switch {
  constructor(name, url, state, itemType) {
    this.name = name;
    this.url = url;
    this.state = state;
    
    if ('GroupItem' === itemType) {
      // Look up the first group member to determine item type
      new RestClient().fetchItem(url, function (item) {
        if (item.members && item.members.length > 0) {
          this.item = this.buildItemType(item.members[0].type);
        }
      });
    } else {
      this.item = this.buildItemType(itemType);
    }
    
    if (this.item) {
      this.accessory = this.item.accessory;
    }
  };
  
  buildItemType(itemType) {
    switch (itemType) {
    case 'RollershutterItem':
      return new RollershutterItem(this.name, this.url, this.state);
      break;
    default:
      return new SwitchItem(this.name, this.url, this.state);
    }
  };
}

export { Switch };
