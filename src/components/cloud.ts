import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface CloudAttributes {
  connected: boolean;
}

export interface CloudConfig {
  enable: boolean;
  server: string | null;
}

/**
 * Handles the Cloud services of a device.
 */
export class Cloud extends Component<CloudAttributes, CloudConfig> implements CloudAttributes {
  /**
   * Whether the device is connected to the Shelly cloud.
   */
  @characteristic()
  readonly connected: boolean = false;

  constructor(device: Device) {
    super('Cloud', device);
  }
}
