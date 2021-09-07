import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface EthernetAttributes {
  ip: string | null;
}

export interface EthernetConfig {
  enable: boolean;
  ipv4mode: 'dhcp' | 'static';
  ip: string | null;
  netmask: string | null;
  gw: string | null;
}

export interface EthernetConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the Ethernet services of a device.
 */
export class Ethernet extends Component {
  /**
   * IP address of the device.
   */
  @characteristic()
  readonly ip: string | null = null;

  constructor(device: Device) {
    super('Eth', device);
  }

  update(data: Partial<EthernetAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<EthernetAttributes> {
    return this.rpc<EthernetAttributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<EthernetConfig> {
    return this.rpc<EthernetConfig>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<EthernetConfig>): PromiseLike<EthernetConfigResponse> {
    return this.rpc<EthernetConfigResponse>('SetConfig', {
      config,
    });
  }
}
