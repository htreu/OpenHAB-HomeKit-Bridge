'use strict';

import { ItemType } from './ItemType';
import { DimmerItem } from './DimmerItem';
import { ColorItem } from './ColorItem';
import { SwitchItem } from './SwitchItem';
import { RollershutterItem } from './RollershutterItem';
import { TemperatureSensor } from './TemperatureSensor';

class ItemProvider {
  constructor(ohVersion) {
    this.ohVersion = ohVersion;
  }

  createHomeKitAccessories(openhabItems) {
    var homeKitAccessories = [];
    for (var i = 0; i < openhabItems.length; i++) {
      let openHABWidget = openhabItems[i];

      // Don't log in tests.
      /* istanbul ignore next */
      if (process.env.NODE_ENV != 'test') {
        console.log("processing widget: "
            + openHABWidget.type
            + " '" + openHABWidget.name + "' "
            + "(" + openHABWidget.itemName + ")"
        );
      }

      let itemType = new ItemType();
      let accessory = undefined;
      if (openHABWidget.type === itemType.SWITCH_ITEM) {
        accessory = new SwitchItem(
          openHABWidget.itemName, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.DIMMER_ITEM) {
        accessory = new DimmerItem(
          openHABWidget.itemName, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.COLOR_ITEM) {
        accessory = new ColorItem(
          openHABWidget.itemName, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.ROLLERSHUTTER_ITEM) {
        accessory = new RollershutterItem(
          openHABWidget.itemName, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.TEMPERATURE_SENSOR) {
        accessory = new TemperatureSensor(
          openHABWidget.itemName, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }

      if (accessory) {
        homeKitAccessories.push(accessory);
      }
    }

    return homeKitAccessories;
  }

}

export { ItemProvider };
