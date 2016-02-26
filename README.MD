[![Build Status](https://travis-ci.org/htreu/OpenHAB-HomeKit-Bridge.svg?branch=master)](https://travis-ci.org/htreu/OpenHAB-HomeKit-Bridge)
[![Coverage Status](https://coveralls.io/repos/htreu/OpenHAB-HomeKit-Bridge/badge.svg?branch=master&service=github)](https://coveralls.io/github/htreu/OpenHAB-HomeKit-Bridge?branch=master)

OpenHAB HomeKit Bridge
=============
OpenHAB HomeKit Bridge bridges openHAB items to Apple´s HomeKit Accessory Protocol. It is based on [hap-nodejs](https://github.com/KhaosT/HAP-NodeJS).

Watch the [demo video here](https://youtu.be/QAbOHhjo05U) and [Siri controlling roller shutters here](https://youtu.be/z9G06-dxblo).

##### Prerequisites
* [openHAB](http://www.openhab.org) server running with at least one Switch item configured
* node.js 0.12.x, 4.0.x or 4.1.x
* an iOS device running iOS 8 or 9
* an iOS app for modifying the HomeKit database (like [elgato eve](https://www.elgato.com/de/eve-app-homekit))
* this repository

##### Install the OpenHAB HomeKit Bridge:
* On non OS X systems install the avahi library:

  `sudo apt-get install avahi-daemon libavahi-compat-libdnssd-dev`
* Install the node module dependencies:

  `npm update`
* Create a custom sitemap which lists all items you want to control with HomeKit:
  ```
  sitemap demo label="HomeKit" {
    # On/Off Item (lights, outlets)
    Switch item=DemoSwitch label="Toggle Switch"

    # Dimmer items (On/Off, Brightness)
    Slider item=DimmedLight label="Dimmed Light" switchSupport

    # RGB light items (On/Off, Brightness, Hue, Saturation)
    Colorpicker item=RGBLight icon="slider"

    # Rollershutter/Blinds
    Switch item=Shutter_GF_Living

    # Temperature sensor, value is taken from label
    Text item=Temperature_GF_Living label="Livingroom [%.1f °C]"
}
  ```

##### Run OpenHAB HomeKit Bridge
This connects to OpenHAB at 192.168.0.99 on port 8080 and loads all items from a sitemap named 'demo.sitemap':

  `npm start -- --name "myOpenHAB-Bridge" --server 192.1.0.99:8080 --sitemap demo`

###### Command line options:

<dl>
<dt>-n, --name</dt>
  <dd>The name of the bridge as shown in the HomeKit database. _This option is mandatory._ </dd>
<dt>-s, --server</dt>
  <dd>The network address and port of the OpenHAB server as ```ip:port```. Defaults to 127.0.0.1:8080</dd>
<dt>-p, --pincode</dt>
  <dd>The pincode used for the bridge accessory. Defaults to 031-45-154.</dd>
<dt>-m, --sitemap</dt>
  <dd>The name of the sitemap to load all items from. Items must not be nested in frames or groups. Defaults to 'homekit'.</dd>
</dl>

To access the bridge from an iOS device (9.0+) use Apples [HomeKit Catalog 2.0](https://developer.apple.com/library/ios/samplecode/HomeKitCatalog/Introduction/Intro.html) demo application or a vendor app like elgato´s eve (see _Prerequisites_). Use the predefined pin code _031-45-154_ to add the bridge as an accessory.

You may use the `start.sh.template` to create your own simple start up script. This gives you at least simple logging output and debugging possibilities in case the bridge runs in the background.

##### Running Tests

To execute unit tests run

`npm test`

To produce test coverage output run

`npm run-script coverage`

##### Known issues
* iOS HomeKit may not delete the bridge properly from its database. In this case the bridge can neither be connected nor added again. Delete the _persist_ folder and restart the bridge with a new name using the 'name' option.

##### Backlog/ToDo
* Distinguish between switches and lights when adding SwitchItems -> see [Issue 29](https://github.com/htreu/OpenHAB-HomeKit-Bridge/issues/29)
* Implement Rollershutter -> see [Issue 7](https://github.com/htreu/OpenHAB-HomeKit-Bridge/issues/7)
