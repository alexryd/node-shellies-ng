# node-shellies-ng
[![npm-version](https://badgen.net/npm/v/shellies-ng)](https://www.npmjs.com/package/shellies-ng)

Handles communication with the next generation of Shelly devices.

For the first generation, see [node-shellies](https://github.com/alexryd/node-shellies).

## Supported devices

* [Shelly Plus 1](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1)
* [Shelly Plus 1 PM](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus1PM)
* [Shelly Plus 2 PM](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlus2PM)
* [Shelly Plus I4](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusI4)
* [Shelly Plus Plug US](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlugUS)
* [Shelly Plus WallDimmer](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusWallDimmer)
* [Shelly Plus H&T](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusHT) <sup>1</sup>
* [Shelly Pro 1](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro1)
* [Shelly Pro 1 PM](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro1PM)
* [Shelly Pro 2](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2)
* [Shelly Pro 2 PM](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro2PM)
* [Shelly Pro 3](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro3)
* [Shelly Pro 4 PM](https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPro4PM)

<sup>1</sup> Support for outbound websockets is a work in progress.

## Basic usage example

```typescript
import {
  Device,
  DeviceId,
  MdnsDeviceDiscoverer,
  Shellies,
  ShellyPlus1,
} from 'shellies-ng';

const shellies = new Shellies();

// handle discovered devices
shellies.on('add', async (device: Device) => {
  console.log(`${device.modelName} discovered`);
  console.log(`ID: ${device.id}`);

  // use instanceof to determine the device model
  if (device instanceof ShellyPlus1) {
    const plus1 = device as ShellyPlus1;

    // toggle the switch
    await plus1.switch0.toggle();
  }
});

// handle asynchronous errors
shellies.on('error', (deviceId: DeviceId, error: Error) => {
  console.error('An error occured:', error.message);
});

// create an mDNS device discoverer
const discoverer = new MdnsDeviceDiscoverer();
// register it
shellies.registerDiscoverer(discoverer);
// start discovering devices
discoverer.start();
```

See [homebridge-shelly-ng]() for a real-world example.
