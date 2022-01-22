import { DeviceId } from '../devices';
import EventEmitter from 'eventemitter3';

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

type DeviceDiscovererEvents = {
  /**
   * The 'discover' event is emitted when a device is discovered.
   */
  discover: (identifiers: DeviceIdentifiers) => void;
  /**
   * The 'error' event is emitted if an asynchronous error occurs.
   */
  error: (error: Error) => void;
};

/**
 * Base class for device discoverers.
 */
export abstract class DeviceDiscoverer extends EventEmitter<DeviceDiscovererEvents> {
  /**
   * Handles a discovered device.
   * Subclasses should call this method when a device has been discovered.
   */
  protected handleDiscoveredDevice(identifiers: DeviceIdentifiers) {
    // emit an event
    this.emit('discover', identifiers);
  }
}
