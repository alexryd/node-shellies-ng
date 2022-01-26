import EventEmitter from 'eventemitter3';

import { Device, DeviceId } from './devices';
import { DeviceDiscoverer, DeviceIdentifiers } from './discovery';
import {
  RpcHandler,
  WebSocketRpcHandlerFactory,
  WebSocketRpcHandlerOptions,
} from './rpc';
import { ShellyDeviceInfo } from './services';

/**
 * Defines configuration options for discovered devices.
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
  /**
   * The password to use if the Shelly device requires authentication.
   * This is used with WebSocket connections.
   */
  password?: string;
}

/**
 * Default options for discovered devices.
 */
const DEFAULT_DEVICE_OPTIONS: Readonly<DeviceOptions> = {
  exclude: false,
  protocol: 'websocket',
};

/**
 * Defines a function that takes a device ID and returns a set of configuration
 * options for that device.
 */
export type DeviceOptionsCallback = (deviceId: DeviceId) => Partial<DeviceOptions> | undefined;

/**
 * Defines configuration options for the `Shellies` class.
 */
export interface ShelliesOptions {
  /**
   * Configuration options for WebSockets.
   */
  websocket?: WebSocketRpcHandlerOptions;
  /**
   * Configuration options for devices.
   */
  deviceOptions: Map<DeviceId, Partial<DeviceOptions>> | DeviceOptionsCallback | null;
}

/**
 * Default `Shellies` options.
 */
const DEFAULT_SHELLIES_OPTIONS: Readonly<ShelliesOptions> = {
  deviceOptions: null,
};

type ShelliesEvents = {
  /**
   * The 'add' event is emitted when a new device has been added.
   */
  add: (device: Device) => void;
  /**
   * The 'remove' event is emitted when a device has been removed.
   */
  remove: (device: Device) => void;
  /**
   * The 'error' event is emitted if an error occurs asynchronously.
   */
  error: (deviceId: DeviceId, error: Error) => void;
  /**
   * The 'exclude' event is emitted when a discovered device is ignored.
   */
  exclude: (deviceId: DeviceId) => void;
  /**
   * The 'unknown' event is emitted when a device with an unrecognized model designation is discovered.
   */
  unknown: (deviceId: DeviceId, model: string) => void;
};

/**
 * This is the main class for the shellies-ng library.
 * This class manages a list of Shelly devices. New devices can be added by registering a device discoverer.
 */
export class Shellies extends EventEmitter<ShelliesEvents> {
  /**
   * Factory used to create new `WebSocketRpcHandler`s.
   */
  readonly websocket = new WebSocketRpcHandlerFactory();

  /**
   * Holds configuration options for this class.
   */
  protected options: ShelliesOptions;

  /**
   * Holds all devices, mapped to their IDs for quick and easy access.
   */
  protected readonly devices: Map<DeviceId, Device> = new Map();

  /**
   * Event handlers bound to `this`.
   */
  protected readonly discoverHandler = this.handleDiscoveredDevice.bind(this);

  /**
   * Holds IDs of devices that have been discovered but not yet added.
   */
  protected readonly pendingDevices = new Set<DeviceId>();

  /**
   * Holds IDs of devices that have been discovered but are excluded or whose
   * model designation isn't recognized.
   */
  protected readonly ignoredDevices = new Set<DeviceId>();

  /**
   * @param opts - A set of configuration options.
   */
  constructor(opts?: Partial<ShelliesOptions>) {
    super();

    // store the options, with default values
    this.options = { ...DEFAULT_SHELLIES_OPTIONS, ...(opts || {}) };
  }

  /**
   * The number of devices.
   */
  get size(): number {
    return this.devices.size;
  }

  /**
   * Adds a device. If a device with the same ID has already been added, an
   * error will be thrown.
   * @param device - The device to add.
   */
  add(device: Device): this {
    // make sure we don't have a device with the same ID
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID ${device.id} already added`);
    }

    // make sure its not marked as pending
    this.pendingDevices.delete(device.id);

    // add the device
    this.devices.set(device.id, device);

    // emit an `add` event
    this.emit('add', device);

    return this;
  }

  /**
   * Determines whether a device has been added.
   * @param deviceOrId - The device or device ID to test.
   * @returns `true` if the device has been added; `false` otherwise.
   */
  has(deviceOrId: Device | DeviceId): boolean {
    const id: DeviceId = deviceOrId instanceof Device ? deviceOrId.id : deviceOrId;
    return this.devices.has(id);
  }

  /**
   * Returns the device with the given ID, or `undefined` if no such device was
   * found.
   */
  get(deviceId: DeviceId): Device | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Executes a provided function once for each device.
   * @param callback - Function to execute for each device.
   * @param thisArg - Value to be used as `this` when executing `callback`.
   */
  forEach(callback: (device: Device, id: DeviceId, set: Shellies) => void, thisArg?) {
    this.devices.forEach((device, id) => {
      callback.call(thisArg, device, id, this);
    });
  }

  /**
   * Returns a new Iterator object that contains an array of
   * `[DeviceId, Device]` for each device.
   */
  entries(): IterableIterator<[DeviceId, Device]> {
    return this.devices.entries();
  }

  /**
   * Returns a new Iterator object that contains the device IDs for each device.
   */
  keys(): IterableIterator<DeviceId> {
    return this.devices.keys();
  }

  /**
   * Returns a new Iterator object that contains each device.
   */
  values(): IterableIterator<Device> {
    return this.devices.values();
  }

  /**
   * Returns a new Iterator object that contains each device.
   */
  [Symbol.iterator](): IterableIterator<Device> {
    return this.devices.values();
  }

  /**
   * Removes a device.
   * @param deviceOrId - The device or ID of the device to remove.
   * @returns `true` if a device has been removed; `false` otherwise.
   */
  delete(deviceOrId: Device | DeviceId): boolean {
    const id: DeviceId = deviceOrId instanceof Device ? deviceOrId.id : deviceOrId;
    const device: Device | undefined = this.devices.get(id);

    if (device !== undefined) {
      this.devices.delete(id);

      // emit a `remove` event
      this.emit('remove', device);

      return true;
    }

    return false;
  }

  /**
   * Removes all devices.
   */
  clear() {
    // emit `remove` events for all devices
    for (const [, device] of this.devices) {
      this.emit('remove', device);
    }

    this.devices.clear();
  }

  /**
   * Registers a device discoverer, making discovered devices be added to this library.
   * @param discoverer - The discoverer to register.
   */
  registerDiscoverer(discoverer: DeviceDiscoverer) {
    discoverer.on('discover', this.discoverHandler);
  }

  /**
   * Unregisters a previously registered device discoverer.
   * @param discoverer - The discoverer to unregister.
   */
  unregisterDiscoverer(discoverer: DeviceDiscoverer) {
    discoverer.removeListener('discover', this.discoverHandler);
  }

  /**
   * Retrieves configuration options for the device with the given ID.
   * @param deviceId - Device ID.
   */
  protected getDeviceOptions(deviceId: DeviceId): DeviceOptions {
    // get all options (with defaults)
    let opts: Partial<DeviceOptions> | undefined = undefined;
    const deviceOptions = this.options.deviceOptions;

    if (deviceOptions instanceof Map) {
      opts = deviceOptions.get(deviceId);
    } else if (typeof deviceOptions === 'function') {
      opts = deviceOptions(deviceId);
    }

    return { ...DEFAULT_DEVICE_OPTIONS, ...(opts || {}) };
  }

  /**
   * Creates an `RpcHandler` for a device.
   * @param identifiers - A set of device identifiers.
   * @param options - Configuration options for the device.
   */
  protected createRpcHandler(identifiers: DeviceIdentifiers, options: DeviceOptions): RpcHandler {
    if (options.protocol === 'websocket' && identifiers.hostname) {
      const opts = { ...this.options.websocket, password: options.password };
      return this.websocket.create(identifiers.hostname, opts);
    }

    // we're missing something
    throw new Error(
      `Missing required device identifier(s) (device ID: ${identifiers.deviceId}, protocol: ${options.protocol})`,
    );
  }

  /**
   * Handles 'discover' events from device discoverers.
   */
  protected async handleDiscoveredDevice(identifiers: DeviceIdentifiers) {
    const deviceId = identifiers.deviceId;

    if (this.devices.has(deviceId) || this.pendingDevices.has(deviceId) || this.ignoredDevices.has(deviceId)) {
      // ignore if we've seen this device before
      return;
    }

    // get the configuration options for this device
    const opts = this.getDeviceOptions(deviceId);

    if (opts.exclude) {
      // exclude this device
      this.ignoredDevices.add(deviceId);
      this.emit('exclude', deviceId);
      return;
    }

    this.pendingDevices.add(deviceId);

    try {
      // create an RPC handler
      const rpcHandler = this.createRpcHandler(identifiers, opts);

      // load info about this device
      const info = await rpcHandler.request<ShellyDeviceInfo>('Shelly.GetDeviceInfo');

      // make sure the returned device ID matches
      if (info.id !== deviceId) {
        throw new Error(`Unexpected device ID (returned: ${info.id}, expected: ${deviceId})`);
      }

      // get the device class for this model
      const cls = Device.getClass(info.model);

      if (cls === undefined) {
        // abort if we don't have a matching device class
        this.ignoredDevices.add(deviceId);
        this.emit('unknown', deviceId, info.model);
        return;
      }

      // create the device
      const device = new cls(info, rpcHandler);
      // load its status
      await device.loadStatus();

      this.pendingDevices.delete(deviceId);

      // add the device
      this.add(device);
    } catch (e) {
      this.pendingDevices.delete(deviceId);

      // create a custom Error
      const message = e instanceof Error ? e.message : String(e);
      const error = new Error(`Failed to add discovered device (id: ${deviceId}): ${message}`);

      if (e instanceof Error) {
        error.stack = e.stack;
      } else {
        Error.captureStackTrace(error);
      }

      // emit the error
      this.emit('error', deviceId, error);
    }
  }
}
