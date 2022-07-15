import { characteristic, Component } from './base';
import { Device } from '../devices';
import { RpcEvent } from '../rpc';

export interface WiFiAttributes {
  sta_ip: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'got ip';
  ssid: string | null;
  rssi: number;
  ap_client_count?: number;
}

export interface WiFiStationConfig {
  ssid: string | null;
  pass?: string | null;
  is_open: boolean;
  enable: boolean;
  ipv4mode: 'dhcp' | 'static';
  ip: string | null;
  netmask: string | null;
  gw: string | null;
  nameserver: string | null;
}

export interface WiFiConfig {
  ap: {
    ssid: string | null;
    is_open: boolean;
    enable: boolean;
    range_extender?: {
      enable: boolean;
    };
  };
  sta: WiFiStationConfig;
  sta1: WiFiStationConfig;
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

export interface WiFiListApClientsResponse {
  ts: number | null;
  ap_clients: Array<{
    mac: string;
    ip: string;
    ip_static: boolean;
    mport: number;
    since: number;
  }>;
}

/**
 * Handles the WiFi services of a device.
 */
export class WiFi extends Component<WiFiAttributes, WiFiConfig, WiFiConfigResponse> implements WiFiAttributes {
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

  /**
   * Number of clients connected to the access point.
   */
  @characteristic()
  readonly ap_client_count: number | undefined;

  constructor(device: Device) {
    super('WiFi', device);
  }

  /**
   * Retrieves a list of available networks.
   */
  scan(): PromiseLike<WiFiScanResponse> {
    return this.rpc<WiFiScanResponse>('Scan');
  }

  /**
   * Returns a list of clients currently connected to the device's access point.
   */
  listApClients(): PromiseLike<WiFiListApClientsResponse> {
    return this.rpc<WiFiListApClientsResponse>('ListAPClients');
  }

  handleEvent(event: RpcEvent) {
    switch (event.event) {
      case 'sta_connect_fail':
        this.emit('connectionError', event.reason);
        break;

      case 'sta_disconnected':
        this.emit('disconnect', event.reason, event.ssid, event.sta_ip);
        break;

      default:
        super.handleEvent(event);
    }
  }
}
