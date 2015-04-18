OpenHAB HAP Bridge
=============
OpenHAB HAP Bridge is a bridge implementation of HomeKit Accessory Server.
The implementation is based on a fork of the original [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) extended with npm package.json and a index.js for the object factories.

Install and run OpenHAB HAP Bridge:
  ```js
  npm install
  npm start
  ```
At this point OpenHAB HAP Bridge will bridge OpenHAB Switch items using the LightBulb Service so only On/Off is supported right now.

To access the bridge from an iDevice use Apples [HomeKit Catalog](https://developer.apple.com/library/ios/samplecode/HomeKitCatalog/Introduction/Intro.html#//apple_ref/doc/uid/TP40015048) demo application or KhaosT´s [HomeKit Demo](https://github.com/KhaosT/HomeKit-Demo). Use the predefined pin code 031-45-154 to add the bridge as an accessory.
