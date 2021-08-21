import { DeviceId } from '../devices';

export declare interface DeviceDiscoverer {
  emit(event: 'discover', deviceId: DeviceId): boolean;

  on(event: 'discover', listener: (deviceId: DeviceId) => void): this;
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
