import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface CloudAttributes {
  connected: boolean;
}

export interface CloudConfig {
  enable: boolean;
  server: string | null;
}

export interface CloudConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the Cloud services of a device.
 */
export class Cloud extends Component {
  /**
   * Whether the device is connected to the Shelly cloud.
   */
  @characteristic()
  readonly connected: boolean = false;

  constructor(device: Device) {
    super('Cloud', device);
  }

  update(data: Partial<CloudAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<CloudAttributes> {
    return this.rpc<CloudAttributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<CloudConfig> {
    return this.rpc<CloudConfig>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<CloudConfig>): PromiseLike<CloudConfigResponse> {
    return this.rpc<CloudConfigResponse>('SetConfig', {
      config,
    });
  }
}
