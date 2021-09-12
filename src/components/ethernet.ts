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
export class Ethernet extends Component<EthernetAttributes, EthernetConfig, EthernetConfigResponse> {
  /**
   * IP address of the device.
   */
  @characteristic()
  readonly ip: string | null = null;

  constructor(device: Device) {
    super('Eth', device);
  }
}
