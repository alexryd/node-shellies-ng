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

/**
 * Configuration options for discovered devices.
 */
export interface DeviceOptions {
  /**
   * Whether this device should be excluded.
   */
  exclude: boolean;
  /**
   * The protocol to use when communicating with the device.
   */
  protocol: 'websocket';
}

/**
 * Defines a function that takes a device ID and returns a set of configuration
 * options for that device.
 */
export type DeviceOptionsCallback = (deviceId: DeviceId) => Partial<DeviceOptions> | undefined;

type DeviceDiscovererEvents = {
  /**
   * The 'discover' event is emitted when a device is discovered.
   */
  discover: (identifiers: DeviceIdentifiers, options: DeviceOptions) => void;
};

/**
 * Base class for device discoverers.
 */
export abstract class DeviceDiscoverer extends EventEmitter<DeviceDiscovererEvents> {
  /**
   * Holds defaukt configuration options for devices.
   */
  readonly defaultDeviceOptions: DeviceOptions = {
    exclude: false,
    protocol: 'websocket',
  };

  /**
   * @param optsCallback - A function that takes a device ID and returns a set of configuration
   * options for that device.
   */
  constructor(protected optsCallback: DeviceOptionsCallback | undefined) {
    super();
  }

  /**
   * Retrieves configuration options for the device with the given ID.
   * @param deviceId - Device ID.
   */
  protected getDeviceOptions(deviceId: DeviceId): DeviceOptions {
    // get all options (with defaults)
    return {
      ...this.defaultDeviceOptions,
      ...(this.optsCallback?.(deviceId) || {}),
    };
  }

  /**
   * Handles a discovered device.
   * Subclasses should call this method when a device has been discovered.
   */
  protected handleDiscoveredDevice(identifiers: DeviceIdentifiers) {
    // get the options for this device
    const opts = this.getDeviceOptions(identifiers.deviceId);
    // abort if it should be excluded
    if (opts.exclude === true) {
      return;
    }

    // emit an event
    this.emit('discover', identifiers, opts);
  }
}
