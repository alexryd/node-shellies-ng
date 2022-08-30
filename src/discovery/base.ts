import { DeviceId } from '../devices';

/**
 * Describes a discovered Shelly device.
 */
export interface DeviceIdentifiers {
  /**
   * Device ID.
   */
  deviceId: DeviceId;
  /**
   * The IP address or hostname of the device, if available.
   */
  hostname?: string;
}

/**
 * Interface that all device discoverers must implement.
 * The 'discover' event should be emitted for each new device discovered.
 */
export interface DeviceDiscoverer {
  /**
   * Adds an event listener for the 'discover' event.
   */
  on(event: 'discover', listener: (identifiers: DeviceIdentifiers) => void): this;
  /**
   * Removes an event listener for the 'discover' event.
   */
  removeListener(event: 'discover', listener: (identifiers: DeviceIdentifiers) => void);
}
