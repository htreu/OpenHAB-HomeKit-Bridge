import Types from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';
var types = Types.types;

class DimmerItem {
  constructor(name, url, state) {
    this.url = url;
    this.state = state;
    this.characteristicsToUpdate = { power: undefined, brightness: undefined };

    this.displayName = name;
    this.username = "1A:2B:3C:4D:5E:FF";
    this.pincode = "031-45-154",
    this.services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
      	cType: types.NAME_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "string",
    		initialValue: name,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Bla",
    		designedMaxLength: 255
      },{
      	cType: types.MANUFACTURER_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "string",
    		initialValue: "openHAB",
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Bla",
    		designedMaxLength: 255
      },{
      	cType: types.MODEL_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "string",
    		initialValue: "dimmerItem",
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Bla",
    		designedMaxLength: 255
      },{
      	cType: types.SERIAL_NUMBER_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "string",
    		initialValue: "<sn>",
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Bla",
    		designedMaxLength: 255
      },{
      	cType: types.IDENTIFY_CTYPE,
      	onUpdate: null,
      	perms: ["pw"],
    		format: "bool",
    		initialValue: false,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Identify Accessory",
    		designedMaxLength: 1
      }]
    },{
      sType: types.LIGHTBULB_STYPE,
      characteristics: [{
      	cType: types.NAME_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "string",
    		initialValue: name,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Bla",
    		designedMaxLength: 255
      },{
      	cType: types.POWER_STATE_CTYPE,
      	onUpdate: this.updateOpenHabItem.bind(this),
        onRead: this.readOpenHabPowerState.bind(this),
        onRegister: this.registerPowerAccessory.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "bool",
    		initialValue: +state > 0 ? true : false,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Turn On the Dimmer",
    		designedMaxLength: 1
      },{
      	cType: types.BRIGHTNESS_CTYPE,
        onUpdate: this.updateOpenHabItem.bind(this),
        onRead: this.readOpenHabPowerState.bind(this),
        onRegister: this.registerBrightnessAccessory.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "int",
    		initialValue: +state,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Adjust Brightness of Light",
    		designedMinValue: 0,
    		designedMaxValue: 100,
    		designedMinStep: 1,
    		unit: "%"
      }]
    }]
  }

  updateOpenHabItem(value) {
		console.log("received dimmer value from iOS: " + value);
		var command = 0;
		if (typeof value === 'boolean') {
			command = value ? '100' : '0';
		} else {
			command = "" + value;
		}
		request.post(
				this.url,
				{
					body: command,
					headers: {'Content-Type': 'text/plain'}
				},
				function (error, response, body) {
						if (!error && response.statusCode == 200) {
								console.log(body)
						}
				}
		);
	}

	readOpenHabPowerState(callback) {
    console.log("read power state from " + this.url);
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body > 0 ? true : false);
		  }
		})
	}

	readOpenHabBrightnessState(url, callback) {
    console.log("read brightness state from " + this.url);
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body);
		  }
		})
	}

  registerPowerAccessory(accessory) {
    console.log("power register called");
    this.characteristicsToUpdate.power = accessory;
    this.characteristicRegistered();
  }

  registerBrightnessAccessory(accessory) {
    console.log("brightness register called");
    this.characteristicsToUpdate.brightness = accessory;
    this.characteristicRegistered();
  }

  characteristicRegistered() {
    if (this.characteristicsToUpdate.power != undefined
      && this.characteristicsToUpdate.brightness != undefined )
    {
      this.updateCharacteristicsValue();
    }
  }

  updateCharacteristicsValue() {
    var _this = this;
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for dimmer item.');
	  });
	  ws.on('message', function(message) {
			if ((+message) >= 0) {
				var brightness = +message;
				// set brightness
				_this.characteristicsToUpdate.brightness
					.updateValue(brightness);
				// update ON/OFF state
				_this.characteristicsToUpdate.power
          .updateValue(brightness > 0 ? true : false);
			}
	  });
	}

}

export { DimmerItem };
