import { Component } from './base';
import { RpcHandler } from '../rpc';

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
export class BluetoothLowEnergy extends Component {
  constructor(rpcHandler: RpcHandler) {
    super('BLE', rpcHandler);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<BluetoothLowEnergyAttributes> {
    return this.rpc<BluetoothLowEnergyAttributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<BluetoothLowEnergyConfig> {
    return this.rpc<BluetoothLowEnergyConfig>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<BluetoothLowEnergyConfig>): PromiseLike<BluetoothLowEnergyConfigResponse> {
    return this.rpc<BluetoothLowEnergyConfigResponse>('SetConfig', {
      config,
    });
  }
}
