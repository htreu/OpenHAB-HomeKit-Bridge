import { inherits } from 'util';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';

let CustomServices = {};
let CustomCharacteristics = {};

// TextInfoCharacteristic
let textInfoCharacteristicUUID = uuid.generate('hap-nodejs:characteristics:textinfo');
CustomCharacteristics.TextInfoCharacteristic = function() {
  Characteristic.call(this, 'Text Info', textInfoCharacteristicUUID);
  this.setProps({
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
  });
  this.value = this.getDefaultValue();
};
inherits(CustomCharacteristics.TextInfoCharacteristic, Characteristic);
CustomCharacteristics.TextInfoCharacteristic.UUID = textInfoCharacteristicUUID;


// TextInfoService
let textInfoServiceUUID = uuid.generate('hap-nodejs:services:textinfo');
CustomServices.TextInfoService = function(displayName, subtype) {
  Service.call(this, displayName, textInfoServiceUUID, subtype);
  this.addCharacteristic(CustomCharacteristics.TextInfoCharacteristic);
};
inherits(CustomServices.TextInfoService, Service);
CustomServices.TextInfoService.UUID = textInfoServiceUUID;



export { CustomServices, CustomCharacteristics };