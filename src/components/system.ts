import { characteristic, Component } from './base';
import { Device } from '../devices';
import { RpcEvent } from '../rpc';

export interface SystemFirmwareUpdate {
  stable?: {
    version: string;
  };
  beta?: {
    version: string;
  };
}

export interface SystemAttributes {
  mac: string;
  restart_required: boolean;
  time: string;
  unixtime: number;
  uptime: number;
  ram_size: number;
  ram_free: number;
  fs_size: number;
  fs_free: number;
  cfg_rev: number;
  available_updates: SystemFirmwareUpdate;
}

export interface SystemConfig {
  device: {
    name: string;
    eco_mode: boolean;
    mac: string;
    fw_id: string;
    profile?: string;
  };
  location: {
    tz: string | null;
    lat: number | null;
    lon: number | null;
  };
  debug: {
    mqtt: {
      enable: boolean;
    };
    websocket: {
      enable: boolean;
    };
    udp: {
      addr: string | null;
    };
  };
  ui_data: Record<string, unknown>;
  rpc_udp: {
    dst_addr: string | null;
    listen_port: number | null;
  };
  sntp: {
    server: string;
  };
  cfg_rev: number;
}

export interface SystemConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the system services of a device.
 */
export class System extends Component<SystemAttributes, SystemConfig, SystemConfigResponse> implements SystemAttributes {
  /**
   * MAC address of the device.
   */
  @characteristic()
  readonly mac: string = '';

  /**
   * true if a restart is required, false otherwise.
   */
  @characteristic()
  readonly restart_required: boolean = false;

  /**
   * Local time in the current timezone (HH:MM).
   */
  @characteristic()
  readonly time: string = '';

  /**
   * Current time in UTC as a UNIX timestamp.
   */
  @characteristic()
  readonly unixtime: number = 0;

  /**
   * Time in seconds since last reboot.
   */
  @characteristic()
  readonly uptime: number = 0;

  /**
   * Total RAM, in bytes.
   */
  @characteristic()
  readonly ram_size: number = 0;

  /**
   * Available RAM, in bytes.
   */
  @characteristic()
  readonly ram_free: number = 0;

  /**
   * File system total size, in bytes.
   */
  @characteristic()
  readonly fs_size: number = 0;

  /**
   * File system available size, in bytes.
   */
  @characteristic()
  readonly fs_free: number = 0;

  /**
   * Configuration revision number.
   */
  @characteristic()
  readonly cfg_rev: number = 0;

  /**
   * Available firmware updates, if any.
   */
  @characteristic()
  readonly available_updates: SystemFirmwareUpdate = {};

  constructor(device: Device) {
    super('Sys', device);
  }

  handleEvent(event: RpcEvent) {
    switch (event.event) {
      case 'ota_begin':
        this.emit('otaBegin', event.msg);
        break;

      case 'ota_progress':
        this.emit('otaProgress', event.progress_percent, event.msg);
        break;

      case 'ota_success':
        this.emit('otaSuccess', event.msg);
        break;

      case 'ota_error':
        this.emit('otaError', event.msg);
        break;

      default:
        super.handleEvent(event);
    }
  }
}
