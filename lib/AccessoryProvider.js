  'use strict';

import { ItemType } from './ItemType.js';

class AccessoryProvider {

  createHomeKitAccessories(openhabItems) {
    var homeKitAccessories = [];
    let itemType = new ItemType();

    for (var i = 0; i < openhabItems.length; i++) {
      let openHABWidget = openhabItems[i];

      // Don't log in tests.
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        console.log("processing widget: "
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
