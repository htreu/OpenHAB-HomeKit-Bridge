import { Accessory, Service, Characteristic, uuid } from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';

class RollershutterItem {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;

    this.accessory = this.buildAccessory(state);
    // listen for OpenHAB updates
    this.updateCharacteristicsValue();
    this.updatingFromOpenHAB = false;
  }

  buildAccessory(state) {
    let position = state === 'UP' ? 100 : 0;
    let accessory = new Accessory(
      this.name, uuid.generate(this.name));

    let service = accessory.addService(Service.WindowCovering, this.name);

    let charactersiticCurrentPosition =
      service.getCharacteristic(Characteristic.CurrentPosition);
    charactersiticCurrentPosition.setValue(position);
    charactersiticCurrentPosition.on('get', this.readOpenHabCurrentPosition.bind(this));

    let charactersiticTargetPosition =
      service.getCharacteristic(Characteristic.TargetPosition);
    charactersiticTargetPosition.setValue(position);
    charactersiticTargetPosition.on('set', this.updateOpenHabItem.bind(this));
    charactersiticTargetPosition.on('get', this.readOpenHabCurrentPosition.bind(this));

    let charactersiticPositionState =
      service.getCharacteristic(Characteristic.PositionState);
    charactersiticPositionState.setValue(Characteristic.PositionState.STOPPED);
    charactersiticPositionState.on('get', this.readOpenHabPositionState.bind(this));

    return accessory;
  }

  updateOpenHabItem(value, callback) {
		console.log("received rollershutter value from iOS: " + value + ' ' + this.url);
		let command = value;
    callback();
		// request.post(
		// 		this.url,
		// 		{ body: command },
		// 		function (error, response, body) {
    //         callback();
		// 		}
		// );
	};

  readOpenHabCurrentPosition(callback) {
    callback(100);
  }

  readOpenHabPositionState(callback) {
    callback(Characteristic.PositionState.STOPPED);
  }

  updateCharacteristicsValue() {
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for rollershutter item.');
	  });
	  ws.on('message', function(message) {
			var position = message;
	  });
	};
}

export { RollershutterItem };
