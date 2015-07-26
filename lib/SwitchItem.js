import Types from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';
var types = Types.types;

class SwitchItem {
  constructor(name, url, state) {
    this.url = url;
    this.characteristicsToUpdate = { power: undefined };

    this.displayName = name;
    this.username = "1A:2B:3C:4D:5E:FF";
    this.pincode = "031-45-154";
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
    		initialValue: "SwitchItem",
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
      sType: types.SWITCH_STYPE,
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
    		initialValue: state === 'ON' ? true : false,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Turn On the Switch",
    		designedMaxLength: 1
      }]
    }];
  }

  registerPowerAccessory(accessory) {
    console.log("power register called");
    this.characteristicsToUpdate.power = accessory;
    this.updateCharacteristicsValue();
  }

  updateCharacteristicsValue() {
    var _this = this;
    var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    ws.on('open', function() {
      console.log('open ws connection for switch characteristic.');
    });
    ws.on('message', function(message) {
      console.log('switch received message: ' + message);
      _this.characteristicsToUpdate.power.updateValue(message === 'ON' ? true : false);
    });
  };

  readOpenHabPowerState(callback) {
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body === "ON" ? true : false);
      }
    })
  };

  updateOpenHabItem(value) {
    console.log("received switch value from iOS: " + value);
    var command = value ? 'ON' : 'OFF';
    request.post(
        this.url,
        { body: command },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
  };
}

export { SwitchItem };
