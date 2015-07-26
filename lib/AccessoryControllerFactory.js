import HAPNodeJS from 'HAP-NodeJS';

class AccessoryControllerFactory {
	constructor() {
		this.types                      = HAPNodeJS.types;
		this.accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
		this.service_Factor             = HAPNodeJS.serviceFactory;
		this.characteristic_Factor      = HAPNodeJS.characteristicFactory;
	}

	publishAccessory(item) {
	  var accessoryController = new this.accessoryController_Factor.AccessoryController();
	  for (var j = 0; j < item.services.length; j++) {
				var serviceTemplate = item.services[j];
	      var service = new this.service_Factor.Service(serviceTemplate.sType);

	      //loop through characteristics
	      for (var k = 0; k < serviceTemplate.characteristics.length; k++) {
	          var characteristicTemplate = serviceTemplate.characteristics[k];
	          var options = {
	              type: characteristicTemplate.cType,
	              perms: characteristicTemplate.perms,
	              format: characteristicTemplate.format,
	              initialValue: characteristicTemplate.initialValue,
	              supportEvents: characteristicTemplate.supportEvents,
	              supportBonjour: characteristicTemplate.supportBonjour,
	              manfDescription: characteristicTemplate.manfDescription,
	              designedMaxLength: characteristicTemplate.designedMaxLength,
	              designedMinValue: characteristicTemplate.designedMinValue,
	              designedMaxValue: characteristicTemplate.designedMaxValue,
	              designedMinStep: characteristicTemplate.designedMinStep,
	              unit: characteristicTemplate.unit,
								onRead: characteristicTemplate.onRead,
								onRegister: characteristicTemplate.onRegister
	          }
	          var characteristic =
	            new this.characteristic_Factor.Characteristic(options, characteristicTemplate.onUpdate);
	          service.addCharacteristic(characteristic);
	      };

	      accessoryController.addService(service);
	  }

	  return accessoryController;
	};
}

export { AccessoryControllerFactory };
