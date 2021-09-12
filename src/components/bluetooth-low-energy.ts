import { Component } from './base';
import { Device } from '../devices';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BluetoothLowEnergyAttributes {}

export interface BluetoothLowEnergyConfig {
  enable: boolean;
}

export interface BluetoothLowEnergyConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the Bluetooth services of a device.
 */
export class BluetoothLowEnergy extends Component<
  BluetoothLowEnergyAttributes,
  BluetoothLowEnergyConfig,
  BluetoothLowEnergyConfigResponse
  > {
  constructor(device: Device) {
    super('BLE', device);
  }
}
