import Types from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';
var types = Types.types;

class RollershutterItem {
  constructor(name, url, state) {
    this.url = url;
    this.characteristicsToUpdate = { targetPosition: undefined };

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
    		initialValue: "RollershutterItem",
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
      sType: types.WINDOW_COVERING_STYPE,
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
      	cType: types.WINDOW_COVERING_CURRENT_POSITION_CTYPE,
        onUpdate: undefined,
        onRead: undefined,
        onRegister: undefined,
      	perms: ["pr"],
    		format: "int",
    		initialValue: 0,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Current window covering position",
    		designedMinValue: 0,
    		designedMaxValue: 100,
    		designedMinStep: 1,
    		unit: "%"
      },{
      	cType: types.WINDOW_COVERING_TARGET_POSITION_CTYPE,
        onUpdate: this.updateOpenHabItem.bind(this),
        //onRead: this.readOpenHabPowerState.bind(this),
        onRegister: this.registerTargetPositionAccessory.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "int",
    		initialValue: state,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Target window covering position",
    		designedMinValue: 0,
    		designedMaxValue: 100,
    		designedMinStep: 1,
    		unit: "%"
      },{
      	cType: types.WINDOW_COVERING_OPERATION_STATE_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
    		format: "int",
    		initialValue: 0,
    		supportEvents: false,
    		supportBonjour: false,
        manfDescription: "Window covering operation state",
    		designedMinValue: 0,
    		designedMaxValue: 2,
    		designedMinStep: 1,
      }]
    }];
  }

  updateOpenHabItem(value) {
		console.log("received rollershutter value from iOS: " + value);
		var command = value;

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
	};

  registerTargetPositionAccessory(characteristic) {
    this.characteristicsToUpdate.targetPosition = characteristic;
    this.updateCharacteristicsValue();
  }

  updateCharacteristicsValue() {
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for rollershutter item.');
	  });
	  ws.on('message', function(message) {
			var position = message;
			this.characteristicsToUpdate.targetPosition.updateValue(position);
	  });
	};
}

export { RollershutterItem };
