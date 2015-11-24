'use strict';

import { ItemType } from './ItemType';
import { DimmerItem } from './DimmerItem';
import { ColorItem } from './ColorItem';
import { SwitchItem } from './SwitchItem';
import { RollershutterItem } from './RollershutterItem';
import { TemperatureSensor } from './TemperatureSensor';
import { HumiditySensor } from './HumiditySensor';

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
            + " '" + openHABWidget.name + "'"
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
        //if we have displayPattern information, we can make more educated guesses as to what information this item sends
        if (openHABWidget.displayPattern) {
          let unitOfMeasurement = openHABWidget.displayPattern.slice(-1).toUpperCase();
          //check if we are likely dealing with temperature
          if (unitOfMeasurement == "C") { //temperature in Celsius
            accessory = new TemperatureSensor(
                openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion, false).accessory;
          } else if (unitOfMeasurement == "F") { //temperature in Fahrenheit
            accessory = new TemperatureSensor(
                openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion, true).accessory;
          } else if (unitOfMeasurement == "%") { //relative humidity
              accessory = new HumiditySensor(
                  openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
          }
        } else {
          //assume default behavior of a temperature
          accessory = new TemperatureSensor(
              openHABWidget.name, openHABWidget.link, openHABWidget.state, this.ohVersion).accessory;
        }
      }
      if (openHABWidget.type == itemType.GROUP_ITEM) {
        if (openHABWidget.tags.indexOf("thermostat" > -1)) {//thermostat type

        } else {
          console.warn("Not sure what to do with group " + openHABWidget.name);
        }
      }

      if (accessory) {
        homeKitAccessories.push(accessory);
      }
    }

    return homeKitAccessories;
  }

}

export { ItemProvider };
