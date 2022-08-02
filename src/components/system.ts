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

export interface SystemWakeupReason {
  boot: 'poweron' | 'software_restart' | 'deepsleep_wake' | 'internal' | 'unknown';
  cause: 'button' | 'usb' | 'periodic' | 'status_update' | 'undefined';
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
  kvs_rev: number;
  schedule_rev?: number;
  webhook_rev?: number;
  available_updates: SystemFirmwareUpdate;
  wakeup_reason?: SystemWakeupReason;
}

export interface SystemConfig {
  device: {
    name: string;
    eco_mode: boolean;
    mac: string;
    fw_id: string;
    profile?: string;
    discoverable: boolean;
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
  sleep?: {
    wakeup_period: number;
  };
  cfg_rev: number;
}

/**
 * Handles the system services of a device.
 */
export class System extends Component<SystemAttributes, SystemConfig> implements SystemAttributes {
  /**
   * MAC address of the device.
   */
  @characteristic
  readonly mac: string = '';

  /**
   * true if a restart is required, false otherwise.
   */
  @characteristic
  readonly restart_required: boolean = false;

  /**
   * Local time in the current timezone (HH:MM).
   */
  @characteristic
  readonly time: string = '';

  /**
   * Current time in UTC as a UNIX timestamp.
   */
  @characteristic
  readonly unixtime: number = 0;

  /**
   * Time in seconds since last reboot.
   */
  @characteristic
  readonly uptime: number = 0;

  /**
   * Total RAM, in bytes.
   */
  @characteristic
  readonly ram_size: number = 0;

  /**
   * Available RAM, in bytes.
   */
  @characteristic
  readonly ram_free: number = 0;

  /**
   * File system total size, in bytes.
   */
  @characteristic
  readonly fs_size: number = 0;

  /**
   * File system available size, in bytes.
   */
  @characteristic
  readonly fs_free: number = 0;

  /**
   * Configuration revision number.
   */
  @characteristic
  readonly cfg_rev: number = 0;

  /**
   * KVS (Key-Value Store) revision number.
   */
  @characteristic
  readonly kvs_rev: number = 0;

  /**
   * Schedule revision number (present if schedules are enabled).
   */
  @characteristic
  readonly schedule_rev: number | undefined;

  /**
   * Webhook revision number (present if schedules are enabled).
   */
  @characteristic
  readonly webhook_rev: number | undefined;

  /**
   * Available firmware updates, if any.
   */
  @characteristic
  readonly available_updates: SystemFirmwareUpdate = {};

  /**
   * Information about boot type and cause (only for battery-operated devices).
   */
  @characteristic
  readonly wakeup_reason: SystemWakeupReason | undefined;

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

      case 'sleep':
        this.emit('sleep');
        break;

      default:
        super.handleEvent(event);
    }
  }
}
