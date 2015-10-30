'use strict';

import { ItemType } from './ItemType.js';
import { DimmerItem } from './DimmerItem.js';
import { ColorItem } from './ColorItem.js';
import { SwitchItem } from './SwitchItem.js';
import { RollershutterItem } from './RollershutterItem.js';
import { TemperatureSensor } from './TemperatureSensor.js';

class ItemProvider {

  createHomeKitAccessories(openhabItems) {
    var homeKitAccessories = [];
    for (var i = 0; i < openhabItems.length; i++) {
      let openHABWidget = openhabItems[i];
      console.log("processing widget: "
        + openHABWidget.type
        + " " + openHABWidget.name);

      let itemType = new ItemType();
      let accessory = undefined;
      if (openHABWidget.type === itemType.SWITCH_ITEM) {
        accessory = new SwitchItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
      }
      if (openHABWidget.type === itemType.DIMMER_ITEM) {
        accessory = new DimmerItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
      }
      if (openHABWidget.type === itemType.COLOR_ITEM) {
        accessory = new ColorItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
      }
      if (openHABWidget.type === itemType.ROLLERSHUTTER_ITEM) {
        accessory = new RollershutterItem(
          openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
      }
      if (openHABWidget.type === itemType.TEMPERATURE_SENSOR) {
        accessory = new TemperatureSensor(
          openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
      }

      if (accessory) {
        homeKitAccessories.push(accessory);
      }
    }

    return homeKitAccessories;
  }

}

export { ItemProvider };
