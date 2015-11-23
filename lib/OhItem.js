import { UpdateListener } from './UpdateListener.js';

class OhItem {
    constructor(name, url, state, ohVersion) {
        if (this.constructor === OhItem) {
            throw new TypeError("Cannot construct OhItem instances directly");
        }
        this.name = name;
        this.url = url;
        this.state = state;

        // listen for OpenHAB updates
        this.listener = undefined;
        this.registerOpenHABListener(ohVersion);
    }

    registerOpenHABListener(ohVersion) {
        switch(ohVersion) {
            case "1":
                console.log("Registering with OpenHab 1 listener");
                let listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
                listener.startListener();
                break;
            case "2":
                console.log("Subscribing for updates from OpenHab 2 listener");
                UpdateListener.addSseSubscriber(this.name, this.updateCharacteristics.bind(this));
                break;
        }
    };
}

export { OhItem };