[![Build Status](https://travis-ci.org/htreu/OpenHAB-HomeKit-Bridge.svg?branch=master)](https://travis-ci.org/htreu/OpenHAB-HomeKit-Bridge)

OpenHAB HomeKit Bridge
=============
OpenHAB HomeKit Bridge is a bridge implementation of the HomeKit Accessory Protocol.
The implementation is based on a fork of the original [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) extended with npm package.json and a index.js for the object factories.

Watch the [demo video here](https://youtu.be/QAbOHhjo05U).

##### Prerequisites
* [OpenHAB](http://www.openhab.org) server running with at least one Switch item configured
* node.js 0.12.x
* iOS Developer account to run a HomeKit application at least in the iOS simulator
* this repository

##### Install OpenHAB HomeKit Bridge:
On non OS X systems install the avahi library:
  ```js
  sudo apt-get install libavahi-compat-libdnssd-dev
  ```
Install the node module dependencies:
  ```js
  npm install
  ```

##### Run OpenHAB HomeKit Bridge
This connects to OpenHAB at 192.168.0.99 on port 8080 and loads all items from a sitemap named 'demo.sitemap':
  ```js
  npm start -- --server 192.1.0.99:8080 --sitemap demo
  ```

##### Command line options:

<dl>
<dt>-s, --server</dt>
  <dd>The network address and port of the OpenHAB server as ip:port. Defaults to 127.0.0.1:8080</dd>
<dt>-p, --pincode</dt>
  <dd>The pincode used for the bridge accessory. Defaults to 031-45-154.</dd>
<dt>-m, --sitemap</dt>
  <dd>The name of the sitemap to load all items from. Items must not be nested in frames or groups. Defaults to 'homekit'.</dd>
</dl>

At this point OpenHAB HomeKit Bridge will bridge [OpenHAB Switch items](https://github.com/openhab/openhab/wiki/Explanation-of-items) using the LightBulb Service so only On/Off is supported right now.

To access the bridge from an iDevice use Apples [HomeKit Catalog](https://developer.apple.com/library/ios/samplecode/HomeKitCatalog/Introduction/Intro.html#//apple_ref/doc/uid/TP40015048) demo application or KhaosT´s [HomeKit Demo](https://github.com/KhaosT/HomeKit-Demo). Use the predefined pin code 031-45-154 to add the bridge as an accessory.

##### Backlog/ToDo
* Add more robust websocket listener for state changes in OpenHAB
* Implement Color item with LightBulb Service
* Implement Rollershutter
