import { DeviceId } from '../devices';

/**
 * Describes an identified Shelly device.
 */
export interface DeviceIdentifiers {
  deviceId?: DeviceId;
  hostname?: string;
}

export declare interface DeviceDiscoverer {
  emit(event: 'discover', identifiers: DeviceIdentifiers): boolean;

  on(event: 'discover', listener: (identifiers: DeviceIdentifiers) => void): this;
}

/**
 * Defines a service that can discover Shelly devices on the local network.
 */
export interface DeviceDiscoverer {
  /**
   * Makes this service start searching for new Shelly devices.
   */
  start(): Promise<void>;
  /**
   * Makes this service stop searching for new Shelly devices.
   */
  stop(): Promise<void>;
}
