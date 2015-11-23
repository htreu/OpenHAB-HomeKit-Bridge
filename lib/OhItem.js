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
                let listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
                listener.startListener();
                break;
            case "2":
                UpdateListener.addSseSubscriber(this.name, this.updateCharacteristics.bind(this));
                break;
        }
    };
}

export { OhItem };