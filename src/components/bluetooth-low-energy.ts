import { Component } from './base';
import { Device } from '../devices';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BluetoothLowEnergyAttributes {}

export interface BluetoothLowEnergyConfig {
  enable: boolean;
}

/**
 * Handles the Bluetooth services of a device.
 */
export class BluetoothLowEnergy extends Component<
  BluetoothLowEnergyAttributes, BluetoothLowEnergyConfig> implements BluetoothLowEnergyAttributes {
  constructor(device: Device) {
    super('BLE', device);
  }
}
