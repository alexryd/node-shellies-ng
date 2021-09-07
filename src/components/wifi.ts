import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface WiFiAttributes {
  sta_ip: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'got ip';
  ssid: string | null;
  rssi: number;
}

export interface WiFiConfig {
  ap: {
    ssid: string | null;
    is_open: boolean;
    enable: boolean;
  };
  sta: {
    ssid: string | null;
    pass?: string;
    is_open: boolean;
    enable: boolean;
    ipv4mode: 'dhcp' | 'static';
    ip: string | null;
    netmask: string | null;
    gw: string | null;
    nameserver: string | null;
  };
  sta1: {
    ssid: string | null;
    pass?: string;
    is_open: boolean;
    enable: boolean;
    ipv4mode: 'dhcp' | 'static';
    ip: string | null;
    netmask: string | null;
    gw: string | null;
    nameserver: string | null;
  };
  roam: {
    rssi_thr: number;
    interval: number;
  };
}

export interface WiFiConfigResponse {
  restart_required: boolean;
}

export interface WiFiScanResponse {
  results: Array<{
    ssid: string | null;
    bssid: string;
    auth: 0 | 1 | 2 | 3 | 4 | 5;
    channel: number;
    rssi: number;
  }>;
}

/**
 * Handles the WiFi services of a device.
 */
export class WiFi extends Component {
  /**
   * IP address of the device.
   */
  @characteristic()
  readonly sta_ip: string | null = null;

  /**
   * Status of the connection.
   */
  @characteristic()
  readonly status: 'disconnected' | 'connecting' | 'connected' | 'got ip' = 'disconnected';

  /**
   * SSID of the network.
   */
  @characteristic()
  readonly ssid: string | null = null;

  /**
   * Signal strength, in dBms.
   */
  @characteristic()
  readonly rssi: number = 0;

  constructor(device: Device) {
    super('WiFi', device);
  }

  update(data: Partial<WiFiAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<WiFiAttributes> {
    return this.rpc<WiFiAttributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<WiFiConfig> {
    return this.rpc<WiFiConfig>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<WiFiConfig>): PromiseLike<WiFiConfigResponse> {
    return this.rpc<WiFiConfigResponse>('SetConfig', {
      config,
    });
  }

  /**
   * Retrieves a list of available networks.
   */
  scan(): PromiseLike<WiFiScanResponse> {
    return this.rpc<WiFiScanResponse>('Scan');
  }
}
