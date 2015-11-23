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
          + " " + openHABWidget.name
        );
      }

      let itemType = new ItemType();
      let accessory = undefined;
      if (openHABWidget.type === itemType.SWITCH_ITEM) {
        accessory = new SwitchItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.DIMMER_ITEM) {
        accessory = new DimmerItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.COLOR_ITEM) {
        accessory = new ColorItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.ROLLERSHUTTER_ITEM) {
        accessory = new RollershutterItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }
      if (openHABWidget.type === itemType.TEMPERATURE_SENSOR) {
        accessory = new TemperatureSensor(
          openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
      }

      if (accessory) {
        homeKitAccessories.push(accessory);
      }
    }

    return homeKitAccessories;
  }

}

export { ItemProvider };
