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

import { ItemType } from './ItemType.js';
import debug from 'debug'; let logger = debug('AccessoryProvider');

class AccessoryProvider {

  createHomeKitAccessories(openhabItems) {
    var homeKitAccessories = [];
    let itemType = new ItemType();

    for (var i = 0; i < openhabItems.length; i++) {
      let openHABWidget = openhabItems[i];

      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        logger("processing widget: "
          + openHABWidget.type
          + " " + openHABWidget.name);
      }

      let itemConstructor = itemType.itemFactory[openHABWidget.type];

      if (!itemConstructor) {
        continue;
      }

      let accessory = new itemConstructor(
        openHABWidget.name,
        openHABWidget.link,
        openHABWidget.state);

      if (accessory) {
        homeKitAccessories.push(accessory.accessory);
      }
    }

    return homeKitAccessories;
  }

}

export { AccessoryProvider };
